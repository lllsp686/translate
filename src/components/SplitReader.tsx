import React, { useState, useRef, useEffect } from 'react'
import type { DocumentBlock, HighlightColor, PaperDocument, ViewLayoutMode } from '../types'
import { MathRenderer } from './MathRenderer'
import { FigureViewer } from './FigureViewer'
import { TableViewer } from './TableViewer'
import { SelectionPopover } from './SelectionPopover'
import { 
  Sparkles, RefreshCw, AlertCircle, Copy, Check, MessageSquare
} from 'lucide-react'

interface SplitReaderProps {
  document: PaperDocument
  layoutMode: ViewLayoutMode
  onTranslateBlock: (blockId: string) => void
  activeBlockId: string | null
  onSetActiveBlockId: (blockId: string | null) => void
  syncScroll?: boolean
  onAddToGlossary: (source: string, target: string) => void
  onAddHighlight: (blockId: string, text: string, color: HighlightColor, note?: string) => void
  onDeleteHighlight?: (id: string) => void
}

export const SplitReader: React.FC<SplitReaderProps> = ({
  document,
  layoutMode,
  onTranslateBlock,
  activeBlockId,
  onSetActiveBlockId,
  syncScroll = true,
  onAddToGlossary,
  onAddHighlight,
}) => {
  const [splitRatio, setSplitRatio] = useState<number>(50) // 50% left, 50% right
  const [isDragging, setIsDragging] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [selectionPopover, setSelectionPopover] = useState<{
    text: string
    blockId: string
    x: number
    y: number
  } | null>(null)

  const leftPaneRef = useRef<HTMLDivElement>(null)
  const rightPaneRef = useRef<HTMLDivElement>(null)
  const isSyncingScroll = useRef<boolean>(false)

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

  // 双向平滑滚动联动
  const handleLeftScroll = () => {
    if (!syncScroll || isSyncingScroll.current) return
    const left = leftPaneRef.current
    const right = rightPaneRef.current
    if (!left || !right) return

    isSyncingScroll.current = true
    const maxLeft = left.scrollHeight - left.clientHeight
    const maxRight = right.scrollHeight - right.clientHeight
    if (maxLeft > 0) {
      right.scrollTop = (left.scrollTop / maxLeft) * maxRight
    }
    setTimeout(() => {
      isSyncingScroll.current = false
    }, 40)
  }

  const handleRightScroll = () => {
    if (!syncScroll || isSyncingScroll.current) return
    const left = leftPaneRef.current
    const right = rightPaneRef.current
    if (!left || !right) return

    isSyncingScroll.current = true
    const maxLeft = left.scrollHeight - left.clientHeight
    const maxRight = right.scrollHeight - right.clientHeight
    if (maxRight > 0) {
      left.scrollTop = (right.scrollTop / maxRight) * maxLeft
    }
    setTimeout(() => {
      isSyncingScroll.current = false
    }, 40)
  }

  // 监听划词事件
  const handleMouseUpSelection = (blockId: string) => {
    setTimeout(() => {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed) {
        return
      }

      const selectedText = selection.toString().trim()
      if (!selectedText || selectedText.length < 2) {
        return
      }

      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      setSelectionPopover({
        text: selectedText,
        blockId,
        x: rect.left + rect.width / 2,
        y: rect.top,
      })
    }, 10)
  }

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

  // 高亮富文本渲染
  const renderHighlightedText = (blockId: string, text: string) => {
    const blockHighlights = (document.highlights || []).filter((h) => h.blockId === blockId)
    if (blockHighlights.length === 0) {
      return text
    }

    // 简单高效的多高亮片元替换
    let fragments: React.ReactNode[] = [text]
    blockHighlights.forEach((hl) => {
      const nextFragments: React.ReactNode[] = []
      fragments.forEach((frag) => {
        if (typeof frag !== 'string') {
          nextFragments.push(frag)
          return
        }

        const parts = frag.split(hl.text)
        parts.forEach((part, index) => {
          if (part) nextFragments.push(part)
          if (index < parts.length - 1) {
            let colorCls = 'bg-amber-200/80 dark:bg-amber-500/30'
            if (hl.color === 'green') colorCls = 'bg-emerald-200/80 dark:bg-emerald-500/30'
            if (hl.color === 'blue') colorCls = 'bg-sky-200/80 dark:bg-sky-500/30'
            if (hl.color === 'purple') colorCls = 'bg-rose-200/80 dark:bg-rose-500/30'

            nextFragments.push(
              <mark
                key={`${hl.id}-${index}`}
                className={`${colorCls} rounded-xs px-1 text-inherit cursor-pointer relative group/mark`}
                title={hl.note ? `批注: ${hl.note}` : '重点标记'}
              >
                {hl.text}
                {hl.note && (
                  <span className="inline-flex items-center ml-0.5 text-neutral-400 group-hover/mark:text-blue-500">
                    <MessageSquare className="h-2.5 w-2.5 inline" />
                  </span>
                )}
              </mark>
            )
          }
        })
      })
      fragments = nextFragments
    })

    return <>{fragments}</>
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
      return (
        <TableViewer table={block.tableData} />
      )
    }

    // 3. 数学公式类型 (Equation)
    if (block.type === 'equation') {
      return (
        <div className="my-3 flex justify-center overflow-x-auto py-2">
          <MathRenderer content={block.originalText} />
        </div>
      )
    }

    // 4. 标题与段落排版
    const rawText = isOriginal ? block.originalText : block.translatedText || ''

    if (block.type === 'title') {
      return (
        <h1 className="font-serif text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 leading-tight">
          {renderHighlightedText(block.id, rawText)}
        </h1>
      )
    }

    if (block.type === 'heading') {
      return (
        <h2 className="mt-6 mb-2 font-serif text-lg font-semibold text-neutral-800 dark:text-neutral-100 border-b border-black/5 dark:border-white/5 pb-1">
          {renderHighlightedText(block.id, rawText)}
        </h2>
      )
    }

    if (block.type === 'abstract') {
      return (
        <div className="my-4 rounded-xl border-l-3 border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 p-4 text-xs font-sans leading-relaxed text-neutral-700 dark:text-neutral-300">
          <div className="mb-1 font-semibold text-blue-600 dark:text-blue-400">
            {isOriginal ? 'ABSTRACT' : '摘要'}
          </div>
          {renderHighlightedText(block.id, rawText)}
        </div>
      )
    }

    // 普通正文段落 (Paragraph)
    return (
      <p className="font-serif text-[14px] leading-relaxed text-neutral-800 dark:text-neutral-200">
        {renderHighlightedText(block.id, rawText)}
      </p>
    )
  }

  // 将块按页码分组展示
  const pagesMap: { [page: number]: DocumentBlock[] } = {}
  document.blocks.forEach((b) => {
    if (!pagesMap[b.pageNumber]) pagesMap[b.pageNumber] = []
    pagesMap[b.pageNumber].push(b)
  })

  return (
    <div 
      className="relative flex h-full w-full overflow-hidden bg-white dark:bg-[#1e1e20]"
      onClick={() => setSelectionPopover(null)}
    >
      {/* 划词悬浮翻译卡片 */}
      {selectionPopover && (
        <SelectionPopover
          text={selectionPopover.text}
          blockId={selectionPopover.blockId}
          position={{ x: selectionPopover.x, y: selectionPopover.y }}
          onClose={() => setSelectionPopover(null)}
          onAddToGlossary={onAddToGlossary}
          onAddHighlight={onAddHighlight}
        />
      )}

      {/* 左栏：原文阅读区 */}
      {layoutMode !== 'translation-only' && (
        <div
          ref={leftPaneRef}
          onScroll={handleLeftScroll}
          style={{
            width: layoutMode === 'original-only' ? '100%' : `${splitRatio}%`,
          }}
          className="h-full overflow-y-auto px-6 py-8 transition-colors select-text"
        >
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="mb-4 flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2 text-xs text-neutral-400">
              <span className="font-semibold uppercase tracking-wider">English Source (英文原文)</span>
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
                      onMouseUp={() => handleMouseUpSelection(block.id)}
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

      {/* 中间拖拽分隔线 */}
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
          onScroll={handleRightScroll}
          style={{
            width: layoutMode === 'translation-only' ? '100%' : `${100 - splitRatio}%`,
          }}
          className="h-full overflow-y-auto px-6 py-8 transition-colors select-text"
        >
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="mb-4 flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2 text-xs text-neutral-400">
              <span className="font-semibold uppercase tracking-wider">Chinese Translation (学术译文)</span>
              <span className="text-[11px] text-blue-500">双栏对齐高保真排版</span>
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
                  const isCompleted = block.status === 'completed'
                  const isTranslating = block.status === 'translating'
                  const isError = block.status === 'error'

                  return (
                    <div
                      key={block.id}
                      data-block-id={block.id}
                      onClick={() => scrollToBlock(block.id, 'left')}
                      onMouseUp={() => handleMouseUpSelection(block.id)}
                      className={`group relative rounded-xl p-3 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-500/8 ring-2 ring-blue-500/40 shadow-xs'
                          : 'hover:bg-black/3 dark:hover:bg-white/3'
                      }`}
                    >
                      {/* 状态动作栏 */}
                      <div className="absolute right-2 top-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isCompleted && block.translatedText && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCopyText(block.id, block.translatedText!)
                            }}
                            className="rounded-md bg-white dark:bg-neutral-800 p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 shadow-xs border border-black/5 dark:border-white/10"
                            title="复制译文"
                          >
                            {copiedId === block.id ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onTranslateBlock(block.id)
                          }}
                          disabled={isTranslating}
                          className="rounded-md bg-white dark:bg-neutral-800 p-1 text-neutral-400 hover:text-blue-500 shadow-xs border border-black/5 dark:border-white/10"
                          title={isCompleted ? '重新翻译' : '翻译此块'}
                        >
                          {isTranslating ? (
                            <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
                          ) : (
                            <Sparkles className="h-3 w-3" />
                          )}
                        </button>
                      </div>

                      {/* 内容展示 */}
                      {isTranslating ? (
                        <div className="flex items-center gap-2 py-4 text-xs text-blue-500 animate-pulse">
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>正在学术精译此段内容...</span>
                        </div>
                      ) : isError ? (
                        <div className="flex items-center justify-between rounded-lg bg-rose-50 dark:bg-rose-950/20 p-2 text-xs text-rose-600">
                          <div className="flex items-center gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>{block.errorMessage || '翻译请求发生异常'}</span>
                          </div>
                          <button
                            onClick={() => onTranslateBlock(block.id)}
                            className="text-xs font-medium underline"
                          >
                            重试
                          </button>
                        </div>
                      ) : isCompleted ? (
                        renderBlockContent(block, false)
                      ) : (
                        <div
                          onClick={() => onTranslateBlock(block.id)}
                          className="flex items-center justify-center rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 py-4 text-xs text-neutral-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                        >
                          <Sparkles className="mr-1 h-3.5 w-3.5" />
                          <span>点击翻译此段学术内容</span>
                        </div>
                      )}
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
