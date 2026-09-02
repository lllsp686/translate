#!/usr/bin/env python3
"""
GreenWhale Paper Translation Engine - High-Fidelity PDF Layout Parser
Uses PyMuPDF (fitz) to extract text blocks, two-column reading flow, formulas, tables, and image bounding boxes.
"""

import sys
import json
import re
import os
import base64
import fitz  # PyMuPDF

def is_math_line(text: str) -> bool:
    """Heuristic check for mathematical equations"""
    math_symbols = ['=', '∑', '∫', '∏', '±', '≤', '≥', '∈', '∉', '⊂', '⊆', '√', 'α', 'β', 'γ', 'θ', 'λ', 'μ', 'σ', 'ω']
    if any(s in text for s in math_symbols):
        return True
    if re.search(r'\b(Eq\.|Equation)\s*\(\d+\)', text):
        return True
    return False

def parse_pdf(pdf_path: str, output_image_dir: str = None) -> dict:
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF not found at {pdf_path}")

    doc = fitz.open(pdf_path)
    file_name = os.path.basename(pdf_path)
    file_size = os.path.getsize(pdf_path)
    page_count = len(doc)

    meta = doc.metadata or {}
    doc_title = meta.get("title") or file_name.replace(".pdf", "")

    all_blocks = []
    block_id_counter = 0

    for page_idx in range(page_count):
        page = doc[page_idx]
        rect = page.rect
        page_width = rect.width
        page_height = rect.height
        page_num = page_idx + 1

        # 1. 提取页面图像及其边界框 (Bounding Box)
        image_info_list = page.get_images(full=True)
        image_boxes = []
        for img_idx, img in enumerate(image_info_list):
            xref = img[0]
            try:
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]
                
                # 获取该图片在页面上的放置矩形
                rects = page.get_image_rects(xref)
                for bbox in rects:
                    # 过滤微小的装饰图标
                    if bbox.width > 80 and bbox.height > 60:
                        b64_str = f"data:image/{image_ext};base64," + base64.b64encode(image_bytes).decode('utf-8')
                        image_boxes.append({
                            "bbox": [bbox.x0, bbox.y0, bbox.x1, bbox.y1],
                            "base64": b64_str,
                            "width": bbox.width,
                            "height": bbox.height
                        })
            except Exception as e:
                pass

        # 2. 识别表格
        tables_data = []
        try:
            tabs = page.find_tables()
            for tab in tabs:
                tab_rect = tab.bbox
                extracted_rows = []
                for row in tab.extract():
                    cells = []
                    for cell in row:
                        val = (cell or "").strip()
                        cells.append({"original": val, "translated": "", "isHeader": False})
                    if any(c["original"] for c in cells):
                        extracted_rows.append(cells)
                
                if extracted_rows:
                    if len(extracted_rows) > 0:
                        for c in extracted_rows[0]:
                            c["isHeader"] = True
                    tables_data.append({
                        "bbox": [tab_rect[0], tab_rect[1], tab_rect[2], tab_rect[3]],
                        "rows": extracted_rows
                    })
        except Exception:
            pass

        # 3. 提取文本块并判定栏数与阅读流
        # get_text("blocks") 返回 (x0, y0, x1, y1, text, block_no, block_type)
        raw_blocks = page.get_text("blocks")

        # 区分单栏/双栏：如果许多块的 x0 位于页面中线附近，则存在双栏
        mid_x = page_width / 2.0
        two_column_threshold = page_width * 0.15

        sorted_blocks = []
        for b in raw_blocks:
            x0, y0, x1, y1, text, b_no, b_type = b
            clean_text = text.strip()
            if not clean_text:
                continue

            # 判断所属栏
            column = 'full'
            if x1 <= mid_x + 15:
                column = 1
            elif x0 >= mid_x - 15:
                column = 2
            else:
                column = 'full'

            sorted_blocks.append({
                "bbox": [x0, y0, x1, y1],
                "text": clean_text,
                "column": column,
                "block_no": b_no
            })

        # 排序：先按栏排列（栏1 -> 栏2），同一栏内按 y0 从上到下排列
        def block_sort_key(item):
            col = item["column"]
            col_rank = 0 if col == 1 else (1 if col == 2 else 0.5)
            # 如果是全宽（如标题、摘要），根据 y0 穿插
            if col == 'full':
                return (item["bbox"][1] // 200, 0, item["bbox"][1])
            return (col_rank, 1, item["bbox"][1])

        sorted_blocks.sort(key=block_sort_key)

        # 4. 合成最终 DocumentBlock
        for sb in sorted_blocks:
            text = sb["text"]
            x0, y0, x1, y1 = sb["bbox"]
            block_id_counter += 1
            block_id = f"block_{page_num}_{block_id_counter}"

            # 判断块类型
            b_type = "paragraph"
            if page_num == 1 and sb["column"] == 'full' and len(text.split('\n')) <= 3 and len(text) < 150 and y0 < 200:
                b_type = "title"
                if not doc_title or doc_title == file_name.replace(".pdf", ""):
                    doc_title = text.replace('\n', ' ')
            elif re.match(r'^(Abstract|ABSTRACT)\b', text):
                b_type = "abstract"
            elif re.match(r'^((\d+(\.\d+)*|[I|V|X]+)\.?\s+([A-Z][a-zA-Z\s]+)|Introduction|Conclusion|Related Work|Methodology|Experiments|Results|References)\b', text, re.IGNORECASE) and len(text) < 120:
                b_type = "heading"
            elif re.match(r'^(Fig\.|Figure)\s*\d+[:\.]?', text, re.IGNORECASE):
                b_type = "figure"
            elif re.match(r'^(Table|Tab\.)\s*\d+[:\.]?', text, re.IGNORECASE):
                b_type = "table"
            elif is_math_line(text) and len(text) < 200:
                b_type = "equation"

            # 检查此文本块是否对应于之前检测到的图表区域内部的文字
            matched_fig = None
            for img_box in image_boxes:
                ix0, iy0, ix1, iy1 = img_box["bbox"]
                # 如果文字在图片内部（用于图层覆写翻译）
                if (x0 >= ix0 - 5 and x1 <= ix1 + 5 and y0 >= iy0 - 5 and y1 <= iy1 + 5):
                    # 属于图内文本标签
                    pass

            all_blocks.append({
                "id": block_id,
                "pageNumber": page_num,
                "type": b_type,
                "column": sb["column"],
                "originalText": text,
                "translatedText": "",
                "status": "idle",
                "bbox": [x0, y0, x1, y1]
            })

        # 将图片作为独立 figure block 加入
        for f_idx, img_box in enumerate(image_boxes):
            block_id_counter += 1
            fig_id = f"fig_{page_num}_{block_id_counter}"
            
            # 搜寻此图片范围内的文字以支持图层覆写 (In-place Overlay)
            text_items = []
            ix0, iy0, ix1, iy1 = img_box["bbox"]
            img_w = ix1 - ix0
            img_h = iy1 - iy0

            # 从原始页面精准提取位于该图片范围内的微小文字
            words = page.get_text("words")
            for w in words:
                wx0, wy0, wx1, wy1, word = w[:5]
                if (wx0 >= ix0 and wx1 <= ix1 and wy0 >= iy0 and wy1 <= iy1):
                    # 换算为百分比坐标 (0 - 100)
                    rx0 = ((wx0 - ix0) / img_w) * 100
                    ry0 = ((wy0 - iy0) / img_h) * 100
                    rx1 = ((wx1 - ix0) / img_w) * 100
                    ry1 = ((wy1 - iy0) / img_h) * 100
                    text_items.append({
                        "id": f"t_{len(text_items)}",
                        "bbox": [round(rx0, 2), round(ry0, 2), round(rx1, 2), round(ry1, 2)],
                        "original": word,
                        "translated": ""
                    })

            all_blocks.append({
                "id": fig_id,
                "pageNumber": page_num,
                "type": "figure",
                "column": "full" if img_w > page_width * 0.6 else 1,
                "originalText": f"[Figure {f_idx + 1} on Page {page_num}]",
                "translatedText": "",
                "status": "idle",
                "bbox": img_box["bbox"],
                "figureData": {
                    "imageUrl": img_box["base64"],
                    "captionOriginal": f"Figure on page {page_num}",
                    "width": img_box["width"],
                    "height": img_box["height"],
                    "textItems": text_items
                }
            })

    result = {
        "id": f"doc_{int(os.path.getmtime(pdf_path))}",
        "fileName": file_name,
        "fileSize": file_size,
        "pageCount": page_count,
        "title": doc_title,
        "blocks": all_blocks,
        "createdAt": int(os.path.getmtime(pdf_path) * 1000),
        "updatedAt": int(os.path.getmtime(pdf_path) * 1000)
    }
    return result

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 pdf_parser.py <path_to_pdf>")
        sys.exit(1)
    
    pdf_file = sys.argv[1]
    parsed_data = parse_pdf(pdf_file)
    print(json.dumps(parsed_data, ensure_ascii=False, indent=2))
