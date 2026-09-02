import type { PaperDocument } from '../types'

export class ExportService {
  // 导出双语 Markdown 笔记
  static exportToMarkdown(doc: PaperDocument): void {
    let md = `# ${doc.title}\n\n`
    md += `> **文献元数据**：${doc.pageCount} 页 · 分类：${doc.category || '未分类'} · 导出时间：${new Date().toLocaleString()}\n\n`
    md += `---\n\n`

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
}
