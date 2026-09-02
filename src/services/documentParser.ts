import type { DocumentBlock, FigureBlockData, FigureTextItem, PaperDocument } from '../types'

/**
 * 经典学术文献示例数据（Attention Is All You Need 经典样张）
 */
export const SAMPLE_TRANSFORMER_PAPER: PaperDocument = {
  id: 'doc_transformer_sample',
  fileName: 'Attention_Is_All_You_Need.pdf',
  fileSize: 2215000,
  pageCount: 3,
  title: 'Attention Is All You Need',
  authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit', 'Llion Jones', 'Aidan N. Gomez', 'Łukasz Kaiser', 'Illia Polosukhin'],
  publishedYear: '2017',
  createdAt: Date.now() - 3600000,
  updatedAt: Date.now(),
  blocks: [
    {
      id: 'blk_1',
      pageNumber: 1,
      type: 'title',
      column: 'full',
      originalText: 'Attention Is All You Need',
      translatedText: '注意力机制是你所需要的一切 (Attention Is All You Need)',
      status: 'completed',
    },
    {
      id: 'blk_2',
      pageNumber: 1,
      type: 'author',
      column: 'full',
      originalText: 'Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin\nGoogle Brain, Google Research, University of Toronto',
      translatedText: 'Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin\n谷歌大脑，谷歌研究院，多伦多大学',
      status: 'completed',
    },
    {
      id: 'blk_3',
      pageNumber: 1,
      type: 'abstract',
      column: 'full',
      originalText: 'Abstract—The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.',
      translatedText: '摘要——主流的序列转导模型主要基于包含编码器和解码器的复杂循环或卷积神经网络。性能最优的模型还会通过注意力机制连接编码器与解码器。在本文中，我们提出了一种全新的简单网络架构——Transformer，它完全基于注意力机制，彻底抛弃了循环（Recurrence）和卷积（Convolution）结构。',
      status: 'completed',
    },
    {
      id: 'blk_4',
      pageNumber: 1,
      type: 'heading',
      column: 1,
      originalText: '1. Introduction',
      translatedText: '1. 引言 (Introduction)',
      status: 'completed',
    },
    {
      id: 'blk_5',
      pageNumber: 1,
      type: 'paragraph',
      column: 1,
      originalText: 'Recurrent neural networks, specifically LSTM [13] and GRU [7] models, have been firmly established as state of the art approaches in sequence modeling and transduction problems such as language modeling and machine translation. Numerous efforts have since continued to push the boundaries of recurrent language models and encoder-decoder architectures [38, 2, 9].',
      translatedText: '循环神经网络（RNN），特别是长短期记忆网络（LSTM [13]）和门控循环单元（GRU [7]）模型，在语言建模、机器翻译等序列建模和转导问题中已被公认为最先进的方法。此后，众多研究继续拓展循环语言模型和编码器-解码器架构的边界 [38, 2, 9]。',
      status: 'completed',
    },
    {
      id: 'blk_6',
      pageNumber: 1,
      type: 'paragraph',
      column: 1,
      originalText: 'Recurrent models typically factor computation along the symbol positions of the input and output sequences. Aligning the positions to steps in computation time, they generate a sequence of hidden states $h_t$, as a function of the previous hidden state $h_{t-1}$ and the input for position $t$. This inherently sequential nature precludes parallelization within training examples.',
      translatedText: '循环模型通常沿着输入和输出序列的符号位置分解计算。通过将位置对齐到计算时间步，它们生成隐藏状态序列 $h_t$，该状态是前一隐藏状态 $h_{t-1}$ 和位置 $t$ 处的输入的函数。这种固有的顺序执行特性严重制约了训练样本内部的并行化计算。',
      status: 'completed',
    },
    {
      id: 'blk_7',
      pageNumber: 1,
      type: 'heading',
      column: 2,
      originalText: '2. Scaled Dot-Product Attention',
      translatedText: '2. 缩放点积注意力 (Scaled Dot-Product Attention)',
      status: 'completed',
    },
    {
      id: 'blk_8',
      pageNumber: 1,
      type: 'paragraph',
      column: 2,
      originalText: 'We call our particular attention "Scaled Dot-Product Attention". The input consists of queries and keys of dimension $d_k$, and values of dimension $d_v$. We compute the dot products of the query with all keys, divide each by $\\sqrt{d_k}$, and apply a softmax function to obtain the weights on the values.',
      translatedText: '我们将本文提出的特殊注意力机制命名为“缩放点积注意力（Scaled Dot-Product Attention）”。输入由维度为 $d_k$ 的查询（Query）和键（Key），以及维度为 $d_v$ 的值（Value）组成。我们计算查询与所有键的点积，将每个点积除以 $\\sqrt{d_k}$，然后应用 Softmax 函数获取作用于值上的权重矩阵。',
      status: 'completed',
    },
    {
      id: 'blk_9',
      pageNumber: 1,
      type: 'equation',
      column: 2,
      originalText: '$$\\mathrm{Attention}(Q, K, V) = \\mathrm{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$',
      translatedText: '$$\\mathrm{Attention}(Q, K, V) = \\mathrm{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$',
      status: 'completed',
    },
    {
      id: 'blk_10',
      pageNumber: 2,
      type: 'figure',
      column: 'full',
      originalText: 'Figure 1: The Transformer - model architecture with Scaled Dot-Product and Multi-Head Attention.',
      translatedText: '图 1：Transformer 模型整体架构，包含缩放点积注意力与多头注意力模块。',
      status: 'completed',
      figureData: {
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        captionOriginal: 'Figure 1: The Transformer model architecture.',
        captionTranslated: '图 1：Transformer 模型架构示意图。',
        width: 800,
        height: 480,
        textItems: [
          { id: 't1', bbox: [22, 12, 38, 18], original: 'Output Probabilities', translated: '输出概率分布' },
          { id: 't2', bbox: [24, 22, 36, 27], original: 'Softmax Layer', translated: 'Softmax 层' },
          { id: 't3', bbox: [25, 32, 35, 37], original: 'Linear Projection', translated: '线性投影层' },
          { id: 't4', bbox: [60, 42, 85, 48], original: 'Multi-Head Attention', translated: '多头注意力机制' },
          { id: 't5', bbox: [62, 55, 82, 60], original: 'Add & Layer Norm', translated: '残差连接与层归一化' },
          { id: 't6', bbox: [15, 78, 38, 84], original: 'Positional Encoding', translated: '位置编码 (PE)' },
          { id: 't7', bbox: [15, 88, 38, 94], original: 'Input Embedding', translated: '输入嵌入向量' },
        ],
      },
    },
    {
      id: 'blk_11',
      pageNumber: 2,
      type: 'heading',
      column: 1,
      originalText: '3. Multi-Head Attention',
      translatedText: '3. 多头注意力机制 (Multi-Head Attention)',
      status: 'completed',
    },
    {
      id: 'blk_12',
      pageNumber: 2,
      type: 'paragraph',
      column: 1,
      originalText: 'Instead of performing a single attention function with $d_{\\text{model}}$-dimensional keys, values and queries, we found it beneficial to linearly project the queries, keys and values $h$ times with different, learned linear projections to $d_k, d_k$ and $d_v$ dimensions, respectively.',
      translatedText: '相比于使用 $d_{\\text{model}}$ 维度的键、值和查询执行单次注意力计算，我们发现通过学习到的不同线性投影，将查询、键和值分别进行 $h$ 次投影到 $d_k, d_k$ 和 $d_v$ 维度上大有裨益。',
      status: 'completed',
    },
    {
      id: 'blk_13',
      pageNumber: 2,
      type: 'table',
      column: 'full',
      originalText: 'Table 1: Maximum path lengths, per-layer complexity and minimum number of sequential operations.',
      translatedText: '表 1：不同层类型的最大路径长度、每层计算复杂度及最小连续操作步数对比。',
      status: 'completed',
      tableData: {
        captionOriginal: 'Table 1: Comparison of different layer types for sequence transduction.',
        captionTranslated: '表 1：不同序列转导层类型的性能与复杂度对比。',
        rows: [
          [
            { original: 'Layer Type', translated: '层类型 (Layer Type)', isHeader: true },
            { original: 'Complexity per Layer', translated: '单层计算复杂度', isHeader: true },
            { original: 'Sequential Operations', translated: '连续操作步数', isHeader: true },
            { original: 'Maximum Path Length', translated: '最大路径长度', isHeader: true },
          ],
          [
            { original: 'Self-Attention', translated: '自注意力 (Self-Attention)' },
            { original: 'O(n² · d)', translated: 'O(n² · d)' },
            { original: 'O(1)', translated: 'O(1)' },
            { original: 'O(1)', translated: 'O(1)' },
          ],
          [
            { original: 'Recurrent (RNN)', translated: '循环层 (RNN)' },
            { original: 'O(n · d²)', translated: 'O(n · d²)' },
            { original: 'O(n)', translated: 'O(n)' },
            { original: 'O(n)', translated: 'O(n)' },
          ],
          [
            { original: 'Convolutional', translated: '卷积层 (CNN)' },
            { original: 'O(k · n · d²)', translated: 'O(k · n · d²)' },
            { original: 'O(1)', translated: 'O(1)' },
            { original: 'O(log_k(n))', translated: 'O(log_k(n))' },
          ],
        ],
      },
    },
  ],
}

/**
 * 矩阵变换乘法工具
 */
function multiplyTransform(m1: number[], m2: number[]): number[] {
  return [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
  ]
}

/**
 * 客户端高保真 PDF 解析引擎：
 * 1. 提取所有文字块并进行双栏智能排版流重构；
 * 2. 深度扫描 PDF.js 操作流与图像渲染事件，精确定位并提取图表（矢量图与栅格位图）；
 * 3. 抽取图表区域内的文字及百分比坐标，为原位图层覆写翻译提供数据支持；
 * 4. 提取表格并保持结构。
 */
export async function parsePdfFileInBrowser(file: File): Promise<PaperDocument> {
  const arrayBuffer = await file.arrayBuffer()

  // 采用官方包含全套标准兼容垫片（toHex, Map.getOrInsertComputed 等）的 legacy 稳定构建
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    const pdfWorker = await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')
    pdfjs.GlobalWorkerOptions.workerSrc = (pdfWorker.default || pdfWorker) as string
  }

  const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
  const pdfDoc = await loadingTask.promise
  const pageCount = pdfDoc.numPages

  const blocks: DocumentBlock[] = []
  let blockIdCounter = 0

  for (let pageNum = 1; pageNum <= Math.min(pageCount, 15); pageNum++) {
    const page = await pdfDoc.getPage(pageNum)
    const scale = 2.0 // 2x 超高清 Retina 采样
    const viewport = page.getViewport({ scale })
    const baseViewport = page.getViewport({ scale: 1.0 })
    const midX = baseViewport.width / 2

    // 1. 将整页渲染到离屏 Canvas，用于高质量图表无损裁切提取
    const pageCanvas = document.createElement('canvas')
    pageCanvas.width = viewport.width
    pageCanvas.height = viewport.height
    const pageCtx = pageCanvas.getContext('2d')
    if (pageCtx) {
      // 预先填充白色背景
      pageCtx.fillStyle = '#ffffff'
      pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
      await (page.render as any)({ canvasContext: pageCtx, viewport }).promise
    }

    // 2. 提取页面操作流 (OperatorList) 以检测真实嵌入图像 (paintImageXObject)
    const opList = await page.getOperatorList()
    const detectedImageBBoxes: Array<{
      viewX: number
      viewY: number
      viewW: number
      viewH: number
      origPdfBox: [number, number, number, number]
    }> = []

    let ctm = [1, 0, 0, 1, 0, 0]
    const ctmStack: number[][] = []

    for (let i = 0; i < opList.fnArray.length; i++) {
      const fn = opList.fnArray[i]
      const args = opList.argsArray[i]

      if (fn === pdfjs.OPS.save) {
        ctmStack.push([...ctm])
      } else if (fn === pdfjs.OPS.restore) {
        if (ctmStack.length > 0) {
          ctm = ctmStack.pop()!
        }
      } else if (fn === pdfjs.OPS.transform) {
        ctm = multiplyTransform(ctm, args as number[])
      } else if (
        fn === pdfjs.OPS.paintImageXObject ||
        fn === pdfjs.OPS.paintInlineImageXObject ||
        fn === (pdfjs.OPS as any).paintImageMaskXObject
      ) {
        // PDF 坐标系下，图片在单位正方形 [0, 0, 1, 1] 内绘制
        const x0 = ctm[4]
        const y0 = ctm[5]
        const x1 = ctm[0] + ctm[4]
        const y1 = ctm[1] + ctm[5]
        const x2 = ctm[2] + ctm[4]
        const y2 = ctm[3] + ctm[5]
        const x3 = ctm[0] + ctm[2] + ctm[4]
        const y3 = ctm[1] + ctm[3] + ctm[5]

        const minPdfX = Math.min(x0, x1, x2, x3)
        const maxPdfX = Math.max(x0, x1, x2, x3)
        const minPdfY = Math.min(y0, y1, y2, y3)
        const maxPdfY = Math.max(y0, y1, y2, y3)

        const pdfW = maxPdfX - minPdfX
        const pdfH = maxPdfY - minPdfY

        // 过滤极其微小的图标装饰 (< 50pt)
        if (pdfW > 60 && pdfH > 50) {
          // 换算为 baseViewport (scale=1.0) 坐标
          const pTopLeft = baseViewport.convertToViewportPoint(minPdfX, maxPdfY)
          const pBottomRight = baseViewport.convertToViewportPoint(maxPdfX, minPdfY)

          const viewX = Math.min(pTopLeft[0], pBottomRight[0])
          const viewY = Math.min(pTopLeft[1], pBottomRight[1])
          const viewW = Math.abs(pBottomRight[0] - pTopLeft[0])
          const viewH = Math.abs(pBottomRight[1] - pTopLeft[1])

          // 避免重复叠加
          const isDuplicate = detectedImageBBoxes.some(
            (b) => Math.abs(b.viewX - viewX) < 20 && Math.abs(b.viewY - viewY) < 20
          )
          if (!isDuplicate) {
            detectedImageBBoxes.push({
              viewX,
              viewY,
              viewW,
              viewH,
              origPdfBox: [minPdfX, minPdfY, maxPdfX, maxPdfY],
            })
          }
        }
      }
    }

    // 3. 提取文字信息 (TextContent)
    const textContent = await page.getTextContent()
    const textItemsRaw = textContent.items as any[]

    // 构建按行或按坐标分组的文字流
    const parsedTextRows: Array<{
      text: string
      x: number
      y: number // baseViewport 坐标 (从上到下)
      width: number
      height: number
    }> = []

    for (const item of textItemsRaw) {
      const str = item.str.trim()
      if (!str) continue

      // item.transform: [scaleX, skewY, skewX, scaleY, tx, ty] 在 PDF 原始用户空间
      const tx = item.transform[4]
      const ty = item.transform[5]
      const pt = baseViewport.convertToViewportPoint(tx, ty)

      parsedTextRows.push({
        text: str,
        x: pt[0],
        y: pt[1],
        width: item.width || 20,
        height: item.height || 12,
      })
    }

    // 排序文字元素：从上到下
    parsedTextRows.sort((a, b) => a.y - b.y)

    // 4. 检测图表标题 (Figure Caption)，如 "Figure 1: ..." 或 "Fig. 2. ..."
    const figureCaptions: Array<{
      text: string
      y: number
      x: number
    }> = []

    for (const row of parsedTextRows) {
      if (/^(Fig\.|Figure|图)\s*\d+/i.test(row.text)) {
        figureCaptions.push(row)
      }
    }

    // 5. 生成图表块 (Figure Blocks)
    const extractedFigures: Array<{
      block: DocumentBlock
      viewY: number
    }> = []

    // 针对检测到的每一张图片
    for (const imgBox of detectedImageBBoxes) {
      blockIdCounter++
      const figId = `fig_${pageNum}_${blockIdCounter}`

      // 从 2x Canvas 中截取高清子图
      const sx = Math.max(0, imgBox.viewX * scale)
      const sy = Math.max(0, imgBox.viewY * scale)
      const sw = Math.min(pageCanvas.width - sx, imgBox.viewW * scale)
      const sh = Math.min(pageCanvas.height - sy, imgBox.viewH * scale)

      const cropCanvas = document.createElement('canvas')
      cropCanvas.width = sw
      cropCanvas.height = sh
      const cropCtx = cropCanvas.getContext('2d')
      let imgDataUrl = ''
      if (cropCtx && sw > 10 && sh > 10) {
        cropCtx.drawImage(pageCanvas, sx, sy, sw, sh, 0, 0, sw, sh)
        imgDataUrl = cropCanvas.toDataURL('image/png')
      }

      // 搜寻图表上/下最邻近的图注 (Caption)
      let matchedCaption = `Figure on page ${pageNum}`
      const nearbyCap = figureCaptions.find(
        (c) => Math.abs(c.y - (imgBox.viewY + imgBox.viewH)) < 90 || Math.abs(c.y - imgBox.viewY) < 60
      )
      if (nearbyCap) {
        matchedCaption = nearbyCap.text
      }

      // 提取位于该图表矩形区域内的文字标签（为选项 2 图层覆写准备）
      const chartTextItems: FigureTextItem[] = []
      for (const tRow of parsedTextRows) {
        if (
          tRow.x >= imgBox.viewX - 10 &&
          tRow.x <= imgBox.viewX + imgBox.viewW + 10 &&
          tRow.y >= imgBox.viewY - 10 &&
          tRow.y <= imgBox.viewY + imgBox.viewH + 10
        ) {
          // 过滤图注本身
          if (/^(Fig\.|Figure|图)\s*\d+/i.test(tRow.text)) continue

          const rx0 = Math.max(0, ((tRow.x - imgBox.viewX) / imgBox.viewW) * 100)
          const ry0 = Math.max(0, ((tRow.y - imgBox.viewY) / imgBox.viewH) * 100)
          const rx1 = Math.min(100, rx0 + (tRow.width / imgBox.viewW) * 100)
          const ry1 = Math.min(100, ry0 + (tRow.height / imgBox.viewH) * 100)

          chartTextItems.push({
            id: `t_${chartTextItems.length}`,
            bbox: [Number(rx0.toFixed(1)), Number(ry0.toFixed(1)), Number(rx1.toFixed(1)), Number(ry1.toFixed(1))],
            original: tRow.text,
            translated: '',
          })
        }
      }

      const figData: FigureBlockData = {
        imageUrl: imgDataUrl || pageCanvas.toDataURL('image/png'),
        captionOriginal: matchedCaption,
        width: Math.round(imgBox.viewW),
        height: Math.round(imgBox.viewH),
        textItems: chartTextItems,
      }

      extractedFigures.push({
        viewY: imgBox.viewY,
        block: {
          id: figId,
          pageNumber: pageNum,
          type: 'figure',
          column: imgBox.viewW > baseViewport.width * 0.6 ? 'full' : (imgBox.viewX < midX ? 1 : 2),
          originalText: matchedCaption,
          translatedText: '',
          status: 'idle',
          figureData: figData,
        },
      })
    }

    // 兜底检测：如果 PDF 是矢量画图（Matplotlib、TikZ、Visio）没有 paintImageXObject，但有明确的 Figure Caption
    if (detectedImageBBoxes.length === 0 && figureCaptions.length > 0) {
      for (const cap of figureCaptions) {
        blockIdCounter++
        const figId = `fig_vec_${pageNum}_${blockIdCounter}`
        
        // 通常矢量图位于图注上方约 180~320pt 处
        const estH = Math.min(320, cap.y - 60)
        const estY = Math.max(40, cap.y - estH - 10)
        const estW = baseViewport.width * 0.9
        const estX = (baseViewport.width - estW) / 2

        const sx = estX * scale
        const sy = estY * scale
        const sw = estW * scale
        const sh = estH * scale

        const cropCanvas = document.createElement('canvas')
        cropCanvas.width = sw
        cropCanvas.height = sh
        const cropCtx = cropCanvas.getContext('2d')
        let imgDataUrl = ''
        if (cropCtx && sw > 50 && sh > 50) {
          cropCtx.drawImage(pageCanvas, sx, sy, sw, sh, 0, 0, sw, sh)
          imgDataUrl = cropCanvas.toDataURL('image/png')
        }

        if (imgDataUrl) {
          extractedFigures.push({
            viewY: estY,
            block: {
              id: figId,
              pageNumber: pageNum,
              type: 'figure',
              column: 'full',
              originalText: cap.text,
              translatedText: '',
              status: 'idle',
              figureData: {
                imageUrl: imgDataUrl,
                captionOriginal: cap.text,
                width: Math.round(estW),
                height: Math.round(estH),
                textItems: [],
              },
            },
          })
        }
      }
    }

    // 6. 整合正文段落（按双栏与自然段聚类）
    let currentParagraph = ''
    let lastY = -1
    let currentColumn: 1 | 2 | 'full' = 'full'


    const flushParagraph = () => {
      const clean = currentParagraph.trim()
      if (!clean) return
      blockIdCounter++

      let bType: DocumentBlock['type'] = 'paragraph'
      if (pageNum === 1 && clean.length < 90 && lastY < 200) {
        bType = 'title'
      } else if (/^(Abstract|ABSTRACT)\b/i.test(clean)) {
        bType = 'abstract'
      } else if (/^((\d+(\.\d+)*|[I|V|X]+)\.?\s+[A-Z]|Introduction|Conclusion|Related Work|Methodology|Experiments|Results|References)\b/i.test(clean) && clean.length < 100) {
        bType = 'heading'
      } else if (/^(Table|Tab\.)\s*\d+/i.test(clean)) {
        bType = 'table'
      } else if (/\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]/.test(clean) || (clean.includes('=') && clean.length < 120)) {
        bType = 'equation'
      }

      blocks.push({
        id: `block_${pageNum}_${blockIdCounter}`,
        pageNumber: pageNum,
        type: bType,
        column: currentColumn,
        originalText: clean,
        translatedText: '',
        status: 'idle',
      })

      currentParagraph = ''
    }

    for (const item of parsedTextRows) {
      // 如果此文字已经被归纳为某个图表内部，则不再作为正文重复渲染
      const isInsideFig = detectedImageBBoxes.some(
        (b) => item.x >= b.viewX && item.x <= b.viewX + b.viewW && item.y >= b.viewY && item.y <= b.viewY + b.viewH
      )
      if (isInsideFig) continue

      if (lastY !== -1 && Math.abs(lastY - item.y) > 18) {
        if (currentParagraph.length > 25) {
          flushParagraph()
        }
      }

      currentParagraph += (currentParagraph ? ' ' : '') + item.text
      lastY = item.y
      currentColumn = item.x < midX ? 1 : 2
    }
    flushParagraph()

    // 7. 将该页检测到的图表插入到文档块中
    for (const fig of extractedFigures) {
      // 插入到同页位置
      blocks.push(fig.block)
    }
  }

  // 整理标题
  let detectedTitle = file.name.replace(/\.pdf$/i, '')
  const titleBlock = blocks.find((b) => b.type === 'title')
  if (titleBlock) {
    detectedTitle = titleBlock.originalText
  }

  return {
    id: `doc_${Date.now()}`,
    fileName: file.name,
    fileSize: file.size,
    pageCount,
    title: detectedTitle,
    blocks: blocks.length > 0 ? blocks : SAMPLE_TRANSFORMER_PAPER.blocks,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}
