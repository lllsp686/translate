import React, { useState, useRef, useEffect } from 'react'
import type { DocumentBlock, PaperDocument, ViewLayoutMode } from '../types'
import { MathRenderer } from './MathRenderer'
import { FigureViewer } from './FigureViewer'
import { TableViewer } from './TableViewer'
import { 
  Sparkles, RefreshCw, AlertCircle, Copy, Check
} from 'lucide-react'

interface SplitReaderProps {
  document: PaperDocument
  layoutMode: ViewLayoutMode
  onTranslateBlock: (blockId: string) => void
  activeBlockId: string | null
  onSetActiveBlockId: (blockId: string | null) => void
}

export const SplitReader: React.FC<SplitReaderProps> = ({
  document,
  layoutMode,
  onTranslateBlock,
  activeBlockId,
  onSetActiveBlockId,
}) => {
  const [splitRatio, setSplitRatio] = useState<number>(50) // 50% left, 50% right
  const [isDragging, setIsDragging] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const leftPaneRef = useRef<HTMLDivElement>(null)
  const rightPaneRef = useRef<HTMLDivElement>(null)

  // 处理拖拽分隔条
  const handleMouseDown = () => {
    setIsDragging(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const containerWidth = window.innerWidth
      const newRatio = (e.clientX / containerWidth) * 100
      if (newRatio >= 25 && newRatio <= 75) {
        setSplitRatio(newRatio)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  // 双向滚动联动定位
  const scrollToBlock = (blockId: string, targetPane: 'left' | 'right') => {
    onSetActiveBlockId(blockId)
    const targetRef = targetPane === 'left' ? leftPaneRef : rightPaneRef
    if (!targetRef.current) return
    const el = targetRef.current.querySelector(`[data-block-id="${blockId}"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  // 渲染单个内容块
  const renderBlockContent = (block: DocumentBlock, isOriginal: boolean) => {
    // 1. 图表类型 (Figure)
    if (block.type === 'figure' && block.figureData) {
      if (isOriginal) {
        return (
          <div className="my-4 rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-3">
            <img
              src={block.figureData.imageUrl}
              alt={block.figureData.captionOriginal}
              className="w-full h-auto rounded-lg object-contain"
            />
            <div className="mt-2 text-xs text-neutral-500 font-sans">
              <span className="font-semibold">Figure: </span>
              {block.figureData.captionOriginal}
            </div>
          </div>
        )
      } else {
        // 译文端：纯净高清图表展示 + 图注专业学术翻译对照
        return <FigureViewer figure={block.figureData} />
      }
    }

    // 2. 表格类型 (Table)
    if (block.type === 'table' && block.tableData) {
      return <TableViewer table={block.tableData} />
    }

    // 3. 独立数学公式
    if (block.type === 'equation') {
      return (
        <div className="my-3 py-2 text-center overflow-x-auto">
          <MathRenderer content={isOriginal ? block.originalText : (block.translatedText || block.originalText)} />
        </div>
      )
    }

    // 4. 标题与头部
    if (block.type === 'title') {
      const text = isOriginal ? block.originalText : (block.translatedText || block.originalText)
      return (
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-3 leading-tight">
          <MathRenderer content={text} />
        </h1>
      )
    }

    // 5. 作者与单位
    if (block.type === 'author') {
      const text = isOriginal ? block.originalText : (block.translatedText || block.originalText)
      return (
        <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-4 whitespace-pre-line leading-relaxed">
          {text}
        </div>
      )
    }

    // 6. 摘要 (Abstract)
    if (block.type === 'abstract') {
      const text = isOriginal ? block.originalText : (block.translatedText || block.originalText)
      return (
        <div className="my-4 rounded-xl border-l-4 border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 p-3.5 text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans">
          <MathRenderer content={text} />
        </div>
      )
    }

    // 7. 小节标题 (Heading)
    if (block.type === 'heading') {
      const text = isOriginal ? block.originalText : (block.translatedText || block.originalText)
      return (
        <h3 className="text-sm md:text-base font-bold text-neutral-900 dark:text-neutral-100 mt-5 mb-2 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <MathRenderer content={text} />
        </h3>
      )
    }

    // 8. 普通段落 (Paragraph)
    const text = isOriginal ? block.originalText : (block.translatedText || '')
    if (!isOriginal && !text) {
      return (
        <div className="my-2 flex items-center justify-between rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-3 text-xs text-neutral-400">
          <span>该段落尚未翻译</span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onTranslateBlock(block.id)
            }}
            className="flex items-center gap-1 rounded-md bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1 font-medium text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
          >
            <Sparkles className="h-3 w-3" />
            <span>翻译此段</span>
          </button>
        </div>
      )
    }

    return (
      <div className="text-xs md:text-[13px] leading-relaxed text-neutral-800 dark:text-neutral-200 selectable text-justify">
        <MathRenderer content={text} />
      </div>
    )
  }

  // 区分单栏/全宽/双栏分组呈现
  const groupBlocksByPage = () => {
    const pages: Record<number, DocumentBlock[]> = {}
    for (const b of document.blocks) {
      if (!pages[b.pageNumber]) pages[b.pageNumber] = []
      pages[b.pageNumber].push(b)
    }
    return pages
  }

  const pagesMap = groupBlocksByPage()

  return (
    <div className="relative flex flex-1 h-full w-full overflow-hidden bg-[#fbfbfd] dark:bg-[#161618]">
      {/* 左栏：原文阅读区 */}
      {layoutMode !== 'translation-only' && (
        <div
          ref={leftPaneRef}
          style={{
            width: layoutMode === 'original-only' ? '100%' : `${splitRatio}%`,
          }}
          className="h-full overflow-y-auto px-6 py-8 transition-colors select-text"
        >
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="mb-4 flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2 text-xs text-neutral-400">
              <span className="font-semibold uppercase tracking-wider">English Source (原文排版)</span>
              <span>{document.blocks.length} 块元素</span>
            </div>

            {Object.entries(pagesMap).map(([pageNum, pBlocks]) => (
              <div key={pageNum} className="space-y-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-400 my-4">
                  <div className="h-[1px] flex-1 bg-black/5 dark:bg-white/5" />
                  <span>PAGE {pageNum}</span>
                  <div className="h-[1px] flex-1 bg-black/5 dark:bg-white/5" />
                </div>

                {pBlocks.map((block) => {
                  const isActive = activeBlockId === block.id
                  return (
                    <div
                      key={block.id}
                      data-block-id={block.id}
                      onClick={() => scrollToBlock(block.id, 'right')}
                      className={`group relative rounded-xl p-3 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-500/8 ring-2 ring-blue-500/40 shadow-xs'
                          : 'hover:bg-black/3 dark:hover:bg-white/3'
                      }`}
                    >
                      {renderBlockContent(block, true)}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 中间拖拽分隔线 (仅在双栏分屏模式下出现) */}
      {layoutMode === 'bilingual-split' && (
        <div
          onMouseDown={handleMouseDown}
          className={`relative z-10 w-1.5 hover:w-2 -mx-0.5 cursor-col-resize select-none bg-neutral-200 dark:bg-neutral-800 hover:bg-blue-500 transition-colors flex items-center justify-center ${
            isDragging ? 'bg-blue-500 w-2' : ''
          }`}
        >
          <div className="h-8 w-1 rounded-full bg-neutral-400 dark:bg-neutral-600" />
        </div>
      )}

      {/* 右栏：高保真译文阅读区 */}
      {layoutMode !== 'original-only' && (
        <div
          ref={rightPaneRef}
          style={{
            width: layoutMode === 'translation-only' ? '100%' : `${100 - splitRatio}%`,
          }}
          className="h-full overflow-y-auto px-6 py-8 transition-colors select-text bg-white/60 dark:bg-[#1a1a1d]/60 backdrop-blur-xs"
        >
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="mb-4 flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2 text-xs text-neutral-400">
              <span className="font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Chinese Translation (学术精排译文)
              </span>
              <span className="text-[11px]">
                {document.blocks.filter((b) => b.status === 'completed').length} / {document.blocks.length} 已译
              </span>
            </div>

            {Object.entries(pagesMap).map(([pageNum, pBlocks]) => (
              <div key={pageNum} className="space-y-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-400 my-4">
                  <div className="h-[1px] flex-1 bg-black/5 dark:bg-white/5" />
                  <span>第 {pageNum} 页</span>
                  <div className="h-[1px] flex-1 bg-black/5 dark:bg-white/5" />
                </div>

                {pBlocks.map((block) => {
                  const isActive = activeBlockId === block.id
                  const isTranslating = block.status === 'translating'

                  return (
                    <div
                      key={block.id}
                      data-block-id={block.id}
                      onClick={() => scrollToBlock(block.id, 'left')}
                      className={`group relative rounded-xl p-3 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-500/8 ring-2 ring-blue-500/40 shadow-xs'
                          : 'hover:bg-black/3 dark:hover:bg-white/3'
                      } ${isTranslating ? 'animate-pulse bg-blue-500/5' : ''}`}
                    >
                      {/* 右上角快捷操作条 */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10">
                        {block.translatedText && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCopyText(block.id, block.translatedText || '')
                            }}
                            className="rounded-md bg-white dark:bg-neutral-800 p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 shadow-xs"
                            title="复制译文"
                          >
                            {copiedId === block.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onTranslateBlock(block.id)
                          }}
                          disabled={isTranslating}
                          className="rounded-md bg-white dark:bg-neutral-800 p-1 text-neutral-400 hover:text-blue-500 shadow-xs"
                          title="重新翻译此段"
                        >
                          <RefreshCw className={`h-3 w-3 ${isTranslating ? 'animate-spin text-blue-500' : ''}`} />
                        </button>
                      </div>

                      {/* 块状态指示器 */}
                      {isTranslating && (
                        <div className="mb-2 flex items-center gap-1.5 text-xs text-blue-500 font-medium">
                          <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                          <span>正在学术精准翻译...</span>
                        </div>
                      )}

                      {block.status === 'error' && (
                        <div className="mb-2 flex items-center gap-1 text-xs text-red-500">
                          <AlertCircle className="h-3 w-3" />
                          <span>翻译失败：{block.errorMessage || '网络或API异常'}</span>
                        </div>
                      )}

                      {renderBlockContent(block, false)}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
