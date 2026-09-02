import type { PaperDocument } from '../types'

export class ExportService {
  // 导出双语 Markdown 笔记
  static exportToMarkdown(doc: PaperDocument): void {
    let md = `# ${doc.title}\n\n`
    md += `> **文献信息**：${doc.pageCount} 页 · 分类：${doc.category || '默认分类'} · 导出时间：${new Date().toLocaleString()}\n\n`

    // 如果有划线批注，先列出划线摘要
    if (doc.highlights && doc.highlights.length > 0) {
      md += `## 🖍️ 重点精读划线与批注 (${doc.highlights.length})\n\n`
      doc.highlights.forEach((h, idx) => {
        md += `${idx + 1}. **高亮内容**：\`${h.text}\`\n`
        if (h.note) md += `   - *批注笔记*：${h.note}\n`
      })
      md += `\n---\n\n`
    }

    doc.blocks.forEach((block) => {
      const trans = block.translatedText || ''
      const orig = block.originalText || ''

      switch (block.type) {
        case 'title':
          if (trans && trans !== orig) {
            md += `# ${trans}\n*原题：${orig}*\n\n`
          } else {
            md += `# ${orig}\n\n`
          }
          break

        case 'heading':
          if (trans && trans !== orig) {
            md += `\n## ${trans} (${orig})\n\n`
          } else {
            md += `\n## ${orig}\n\n`
          }
          break

        case 'abstract':
          md += `### 摘要 (Abstract)\n\n`
          if (trans) {
            md += `**【译文】**：${trans}\n\n`
          }
          md += `**【原文】**：${orig}\n\n`
          break

        case 'equation':
          md += `$$\n${orig.replace(/\$\$/g, '').trim()}\n$$\n\n`
          break

        case 'figure':
          if (block.figureData) {
            md += `![${block.figureData.captionOriginal}](${block.figureData.imageUrl})\n\n`
            if (block.figureData.captionTranslated) {
              md += `*图注译文*：${block.figureData.captionTranslated}\n\n`
            }
            md += `*图注原文*：${block.figureData.captionOriginal}\n\n`
          }
          break

        case 'table':
          if (block.tableData) {
            if (block.tableData.captionTranslated) {
              md += `**表注译文**：${block.tableData.captionTranslated}\n\n`
            }
            md += `**表注原文**：${block.tableData.captionOriginal}\n\n`
          }
          break

        case 'paragraph':
        default:
          if (trans) {
            md += `${trans}\n\n`
            md += `> <small style="color: #666;">${orig}</small>\n\n`
          } else {
            md += `${orig}\n\n`
          }
          break
      }
    })

    // 触发客户端下载
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${doc.title.replace(/[\/\\?%*:|"<>]/g, '_')}_双语精读笔记.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // 导出为独立高保真 HTML（支持直接一键打印为双语 PDF）
  static exportToHTML(doc: PaperDocument): void {
    let bodyContent = ''

    doc.blocks.forEach((block) => {
      const trans = block.translatedText || ''
      const orig = block.originalText || ''

      if (block.type === 'title') {
        bodyContent += `
          <div class="block title-block">
            <h1 class="trans-title">${trans || orig}</h1>
            ${trans && trans !== orig ? `<div class="orig-title">${orig}</div>` : ''}
          </div>
        `
      } else if (block.type === 'heading') {
        bodyContent += `
          <div class="block heading-block">
            <h2>${trans || orig}</h2>
            ${trans && trans !== orig ? `<div class="orig-sub">${orig}</div>` : ''}
          </div>
        `
      } else if (block.type === 'figure' && block.figureData) {
        bodyContent += `
          <div class="block figure-block">
            <img src="${block.figureData.imageUrl}" alt="${block.figureData.captionOriginal}" />
            ${block.figureData.captionTranslated ? `<div class="caption trans-caption"><b>图注译文：</b>${block.figureData.captionTranslated}</div>` : ''}
            <div class="caption orig-caption"><b>图注原文：</b>${block.figureData.captionOriginal}</div>
          </div>
        `
      } else if (block.type === 'equation') {
        bodyContent += `
          <div class="block math-block">
            <code>${orig}</code>
          </div>
        `
      } else {
        bodyContent += `
          <div class="block paragraph-block">
            ${trans ? `<div class="trans-text">${trans}</div>` : ''}
            <div class="orig-text">${orig}</div>
          </div>
        `
      }
    })

    const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${doc.title} - PaperLens 双语学术精读</title>
  <style>
    @page { margin: 20mm; size: A4; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.68;
      color: #1a1a1a;
      background: #fafafa;
      padding: 40px 20px;
      margin: 0;
    }
    .container {
      max-width: 860px;
      margin: 0 auto;
      background: #ffffff;
      padding: 48px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    .meta-bar {
      border-bottom: 2px solid #f0f0f2;
      padding-bottom: 16px;
      margin-bottom: 28px;
      font-size: 12px;
      color: #777;
      display: flex;
      justify-content: space-between;
    }
    .print-btn {
      background: #0066cc;
      color: #fff;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
    }
    .block {
      margin-bottom: 24px;
    }
    h1.trans-title {
      font-size: 26px;
      font-weight: 700;
      color: #111;
      margin-bottom: 6px;
      line-height: 1.3;
    }
    .orig-title {
      font-size: 15px;
      color: #666;
      font-style: italic;
      margin-bottom: 20px;
    }
    h2 {
      font-size: 19px;
      font-weight: 600;
      color: #0055b3;
      border-left: 4px solid #0066cc;
      padding-left: 10px;
      margin-top: 32px;
      margin-bottom: 4px;
    }
    .orig-sub {
      font-size: 13px;
      color: #888;
      margin-bottom: 16px;
      padding-left: 14px;
    }
    .trans-text {
      font-size: 15px;
      color: #1a1a1a;
      margin-bottom: 6px;
    }
    .orig-text {
      font-size: 13px;
      color: #737373;
      background: #f8f9fa;
      padding: 8px 12px;
      border-radius: 6px;
      border-left: 2px solid #e0e0e0;
    }
    .figure-block {
      text-align: center;
      background: #fff;
      border: 1px solid #eaeaea;
      padding: 16px;
      border-radius: 10px;
    }
    .figure-block img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
    }
    .caption {
      font-size: 12px;
      text-align: left;
      margin-top: 8px;
    }
    .trans-caption { color: #0066cc; }
    .orig-caption { color: #666; }
    .math-block {
      background: #f4f6f9;
      padding: 12px;
      border-radius: 6px;
      font-family: "Courier New", Courier, monospace;
      font-size: 14px;
      overflow-x: auto;
      text-align: center;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .container { box-shadow: none; padding: 0; }
      .print-btn { display: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="meta-bar">
      <span>PaperLens 双语文献精读 · ${doc.title} (${doc.pageCount} 页) · 分类: ${doc.category || '默认'}</span>
      <button class="print-btn" onclick="window.print()">🖨️ 打印 / 另存为 PDF</button>
    </div>
    ${bodyContent}
  </div>
</body>
</html>`

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${doc.title.replace(/[\/\\?%*:|"<>]/g, '_')}_双语精读排版.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}
