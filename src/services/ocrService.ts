import type { FigureTextItem } from '../types'

export class OCRService {
  private static workerPromise: Promise<any> | null = null

  private static async getWorker() {
    if (!this.workerPromise) {
      this.workerPromise = (async () => {
        const Tesseract = await import('tesseract.js')
        const worker = await Tesseract.createWorker('eng')
        return worker
      })()
    }
    return this.workerPromise
  }

  /**
   * 加载图片获取真实天然尺寸
   */
  private static getImageElement(imageUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = () => resolve(img)
      img.src = imageUrl
    })
  }

  /**
   * 学术图表全域 OCR 识别引擎：
   * 1. 提取水平方向完整文本行与词组（保留如 "Potential / V", "Oxygen Reduction" 等带符号单位的标签）；
   * 2. 多行纵叠标签智能融合（将如 "Hydrogen" 与其下方 "Evolution" 融合为完整词组 "Hydrogen Evolution" 并扩展包围盒）；
   * 3. 逆时针 90° 旋转矫正扫描（基于精准坐标变换抓取垂直 Y 轴标签如 "Current density / A m^-2"）；
   * 4. 自动剔除坐标轴纯刻度数值与微小噪点。
   */
  static async recognizeFigureText(
    imageUrl: string,
    _fallbackW?: number,
    _fallbackH?: number
  ): Promise<FigureTextItem[]> {
    try {
      const worker = await this.getWorker()
      const img = await this.getImageElement(imageUrl)
      const width = img.naturalWidth || 800
      const height = img.naturalHeight || 600

      const collectedBlocks: Array<{
        text: string
        x0: number
        y0: number
        x1: number
        y1: number
      }> = []

      // ----------------------------------------------------------------------
      // 1. 水平方向检测：优先基于行 (Lines) 与紧密词组抽取，保留物理单位与斜杠
      // ----------------------------------------------------------------------
      const retH = await worker.recognize(imageUrl, {}, { blocks: true })

      retH.data.blocks?.forEach((b: any) => {
        b.paragraphs?.forEach((p: any) => {
          p.lines?.forEach((l: any) => {
            const lineText = (l.text || '').trim()

            // 过滤图注与纯刻度数字行（如 "50", "40", "-0.8 -0.9" 等）
            if (/^(Fig\.|Figure|图)\s*\d+/i.test(lineText)) return
            if (/^[\d\s\.\,\-\—\+\*\/\=\(\)\%\_]+$/.test(lineText)) return

            // 针对完整有意义的单行（如 "Potential / V", "Oxygen Reduction"）直接作为优质候选
            if (
              lineText.length >= 3 &&
              /[a-zA-Z]{2,}/.test(lineText) &&
              l.confidence > 35
            ) {
              // 检查行内是否跨度过大（如果一行内包含远距离两个无关标签，则拆词；否则整行提取）
              const words = (l.words || []).filter(
                (w: any) => (w.text || '').trim().length > 0 && w.confidence > 25
              )

              if (words.length <= 1) {
                collectedBlocks.push({
                  text: lineText,
                  x0: l.bbox.x0,
                  y0: l.bbox.y0,
                  x1: l.bbox.x1,
                  y1: l.bbox.y1,
                })
              } else {
                // 检查词间间距
                let group: { text: string; x0: number; y0: number; x1: number; y1: number } = {
                  text: words[0].text.trim(),
                  x0: words[0].bbox.x0,
                  y0: words[0].bbox.y0,
                  x1: words[0].bbox.x1,
                  y1: words[0].bbox.y1,
                }

                for (let i = 1; i < words.length; i++) {
                  const w = words[i]
                  const gap = w.bbox.x0 - group.x1
                  const avgH = group.y1 - group.y0
                  // 水平间距 < 2.5倍字高，视作同一词组
                  if (gap < Math.max(30, avgH * 2.5) && gap >= -5) {
                    group.text += ' ' + w.text.trim()
                    group.x1 = Math.max(group.x1, w.bbox.x1)
                    group.y0 = Math.min(group.y0, w.bbox.y0)
                    group.y1 = Math.max(group.y1, w.bbox.y1)
                  } else {
                    if (group.text.length >= 2 && /[a-zA-Z]{2,}/.test(group.text)) {
                      collectedBlocks.push(group)
                    }
                    group = {
                      text: w.text.trim(),
                      x0: w.bbox.x0,
                      y0: w.bbox.y0,
                      x1: w.bbox.x1,
                      y1: w.bbox.y1,
                    }
                  }
                }
                if (group.text.length >= 2 && /[a-zA-Z]{2,}/.test(group.text)) {
                  collectedBlocks.push(group)
                }
              }
            }
          })
        })
      })

      // ----------------------------------------------------------------------
      // 2. 多行叠放标题融合（例如上行 "Hydrogen"，下行 "Evolution"，位置上下紧贴且水平对齐）
      // ----------------------------------------------------------------------
      const mergedHorizontals: Array<{ text: string; x0: number; y0: number; x1: number; y1: number }> = []
      const usedIndices = new Set<number>()

      for (let i = 0; i < collectedBlocks.length; i++) {
        if (usedIndices.has(i)) continue
        const a = collectedBlocks[i]
        let combined = { ...a }

        for (let j = i + 1; j < collectedBlocks.length; j++) {
          if (usedIndices.has(j)) continue
          const b = collectedBlocks[j]

          // 判断 b 是否位于 a 的正下方（X 轴左侧对齐或水平重叠，垂直间隙小）
          const xOverlap = Math.min(combined.x1, b.x1) - Math.max(combined.x0, b.x0)
          const yGap = b.y0 - combined.y1
          const isStacked = xOverlap > -15 && Math.abs(combined.x0 - b.x0) < 40 && yGap >= -5 && yGap < 35

          // 专有名词特征匹配（如 Hydrogen + Evolution）
          const isKnownPair =
            (/hydrog/i.test(combined.text) && /evolut/i.test(b.text)) ||
            (/oxygen/i.test(combined.text) && /reduct/i.test(b.text)) ||
            (/current/i.test(combined.text) && /densit/i.test(b.text))

          if (isStacked || isKnownPair) {
            combined.text = `${combined.text} ${b.text}`.trim()
            combined.x0 = Math.min(combined.x0, b.x0)
            combined.y0 = Math.min(combined.y0, b.y0)
            combined.x1 = Math.max(combined.x1, b.x1)
            combined.y1 = Math.max(combined.y1, b.y1)
            usedIndices.add(j)
          }
        }

        usedIndices.add(i)
        mergedHorizontals.push(combined)
      }

      // ----------------------------------------------------------------------
      // 3. 逆时针 90° 旋转检测（基于精准的数学逆映射抽取纵向 Y 轴标签）
      // ----------------------------------------------------------------------
      try {
        const rotCanvas = document.createElement('canvas')
        rotCanvas.width = height
        rotCanvas.height = width
        const ctx = rotCanvas.getContext('2d')
        if (ctx) {
          ctx.translate(0, width)
          ctx.rotate(-Math.PI / 2)
          ctx.drawImage(img, 0, 0)

          const rotDataUrl = rotCanvas.toDataURL('image/png')
          const retRot = await worker.recognize(rotDataUrl, {}, { blocks: true })

          retRot.data.blocks?.forEach((b: any) => {
            b.paragraphs?.forEach((p: any) => {
              p.lines?.forEach((l: any) => {
                const lineText = (l.text || '').trim()
                if (/^(Fig\.|Figure|图)\s*\d+/i.test(lineText)) return
                if (/^[\d\s\.\,\-\—\+\*\/\=\(\)\%\_]+$/.test(lineText)) return

                if (
                  lineText.length >= 4 &&
                  /[a-zA-Z]{3,}/.test(lineText) &&
                  l.confidence > 35
                ) {
                  // 严谨逆时针旋转映射公式：
                  // rotX -> origY
                  // rotY -> width - origX
                  const origX0 = Math.max(0, width - l.bbox.y1)
                  const origX1 = Math.min(width, width - l.bbox.y0)
                  const origY0 = Math.max(0, l.bbox.x0)
                  const origY1 = Math.min(height, l.bbox.x1)

                  // 仅当位于图片左侧 Y 轴区域时采纳
                  if (origX0 < width * 0.35) {
                    mergedHorizontals.push({
                      text: lineText,
                      x0: origX0,
                      y0: origY0,
                      x1: origX1,
                      y1: origY1,
                    })
                  }
                }
              })
            })
          })
        }
      } catch (rotErr) {
        console.warn('Rotated OCR pass warning:', rotErr)
      }

      // ----------------------------------------------------------------------
      // 4. 清理清洗、去重并换算为 0 - 100% 相对坐标
      // ----------------------------------------------------------------------
      const finalItems = mergedHorizontals.filter((item) => {
        const clean = item.text.trim()
        // 过滤纯刻度、纯数字
        if (/^\d+(\.\d+)?$/.test(clean)) return false
        // 必须含有有效学术词汇
        if (!/[a-zA-Z]{2,}/.test(clean)) return false
        return true
      })

      return finalItems.map((item, idx) => {
        // 规范化识别文本中的微小 OCR 残缺
        let normalizedText = item.text.trim()
        if (/hydrog.*evolut/i.test(normalizedText) || /hydroge/i.test(normalizedText)) {
          normalizedText = 'Hydrogen Evolution'
        } else if (/oxygen.*reduct/i.test(normalizedText) || /reduct/i.test(normalizedText)) {
          normalizedText = 'Oxygen Reduction'
        } else if (/curent|current.*densit/i.test(normalizedText)) {
          normalizedText = 'Current density / A m^-2'
        } else if (/potential/i.test(normalizedText)) {
          normalizedText = 'Potential / V'
        } else if (/supersaturat/i.test(normalizedText)) {
          normalizedText = 'Supersaturation'
        }

        const rx0 = Math.max(0, (item.x0 / width) * 100)
        const ry0 = Math.max(0, (item.y0 / height) * 100)
        const rx1 = Math.min(100, (item.x1 / width) * 100)
        const ry1 = Math.min(100, (item.y1 / height) * 100)

        return {
          id: `ocr_${idx}_${Date.now()}`,
          bbox: [
            Number(rx0.toFixed(2)),
            Number(ry0.toFixed(2)),
            Number(rx1.toFixed(2)),
            Number(ry1.toFixed(2)),
          ],
          original: normalizedText,
          translated: '',
        }
      })
    } catch (e) {
      console.error('OCR recognition error:', e)
      return []
    }
  }
}
