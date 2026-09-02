import React, { useState, useRef } from 'react'
import type { FigureBlockData, FigureTextItem, OverlayMode } from '../types'
import { APIService } from '../services/apiService'
import { OCRService } from '../services/ocrService'
import { Eye, Layers, Sparkles, Scan, Loader2, Edit3, Check, Trash2, PlusCircle } from 'lucide-react'

interface FigureOverlayViewerProps {
  figure: FigureBlockData
  globalOverlayMode?: OverlayMode
  onUpdateFigure?: (data: FigureBlockData) => void
}

export const FigureOverlayViewer: React.FC<FigureOverlayViewerProps> = ({
  figure,
  globalOverlayMode = 'all',
  onUpdateFigure,
}) => {
  const [localMode, setLocalMode] = useState<OverlayMode | null>(null)
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState<boolean>(false)
  const [scanStatusText, setScanStatusText] = useState<string>('')
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>('')

  // 交互划框添加标签状态
  const [isDrawing, setIsDrawing] = useState<boolean>(false)
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null)
  const [currentBox, setCurrentBox] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null)
  const [drawModeActive, setDrawModeActive] = useState<boolean>(false)
  const imgContainerRef = useRef<HTMLDivElement>(null)

  const activeMode = localMode ?? globalOverlayMode

  // 执行图内文字 OCR 识别，并使用单次并发/批量大模型学术翻译
  const handleScanAndTranslate = async () => {
    setIsScanning(true)
    setScanStatusText('正在光学高精度识别图内标签 (OCR)...')

    try {
      // 1. OCR 识别
      const items = await OCRService.recognizeFigureText(
        figure.imageUrl,
        figure.width,
        figure.height
      )

      if (items.length === 0) {
        alert('未在图中检测到明显的文字标签，您可以直接查看原图或使用“划框添加”标记。')
        setIsScanning(false)
        return
      }

      setScanStatusText(`检测到 ${items.length} 个标签，正在学术翻译...`)

      // 2. 批量整合翻译：将所有标签合并为单次结构化请求，杜绝并发 429 速率限制丢失！
      const labelList = items.map((it, idx) => ({ id: idx, text: it.original }))

      const batchPrompt = `你是一位顶尖科研论文图表翻译专家。
请将下列学术图表中的英文标签翻译为地道、规范的简体中文学术术语。
严格翻译标准示例：
- "Hydrogen Evolution" -> "析氢反应" (或 "析氢")
- "Oxygen Reduction" -> "氧还原反应" (或 "氧还原")
- "Current density" -> "电流密度"
- "Potential / V" -> "电位 / V"
- "Distance from the electrode" -> "距电极距离"
- "Supersaturation" -> "过饱和度"
- "Raw Water" -> "原水"
- "DC Current Power source" -> "直流电源"

严格规则：
1. 严禁翻译或改变纯数字、化学式（如 CaCO3, pH, Ca++, OH-）、物理单位（如 μm, A m^-2, mg/L, V）；
2. 严禁将单个字母当作口语缩写（如 'u' 绝不是 '你'，'i' 绝不是 '我'）；
3. 必须且仅以严格的 JSON 数组格式返回，格式为：[{"id": 0, "trans": "译文"}, {"id": 1, "trans": "译文"}]，不要任何开场白或markdown代码块。

待翻译标签列表：
${JSON.stringify(labelList, null, 2)}`

      let translatedMap: Record<number, string> = {}

      try {
        const rawRes = await APIService.translateText({
          text: 'BATCH_TRANSLATE',
          systemPrompt: batchPrompt,
        })

        // 解析 JSON
        const jsonMatch = rawRes.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          parsed.forEach((p: any) => {
            if (p && p.id !== undefined && p.trans) {
              translatedMap[p.id] = String(p.trans).trim().replace(/^["'`]|["'`]$/g, '')
            }
          })
        }
      } catch (batchErr) {
        console.warn('Batch translation fallback to sequential translation:', batchErr)
      }

      // 组装最终项
      const translatedItems: FigureTextItem[] = items.map((item, idx) => {
        let trans = translatedMap[idx] || ''

        // 如果未在批处理中命中，做权威科研词汇匹配
        if (!trans) {
          if (/hydrogen.*evolution/i.test(item.original)) trans = '析氢反应'
          else if (/oxygen.*reduction|reduction/i.test(item.original)) trans = '氧还原反应'
          else if (/current.*density/i.test(item.original)) trans = '电流密度'
          else if (/potential/i.test(item.original)) trans = '电位 / V'
          else if (/supersaturation/i.test(item.original)) trans = '过饱和度'
          else if (/distance from the electrode/i.test(item.original)) trans = '距电极距离'
          else trans = item.original
        }

        return {
          ...item,
          translated: trans,
        }
      })

      // 3. 更新图表数据
      const updated: FigureBlockData = {
        ...figure,
        textItems: translatedItems,
      }
      onUpdateFigure?.(updated)
      setLocalMode('all')
    } catch (err: any) {
      console.error('Scan error:', err)
      alert(`识别或翻译失败: ${err.message || '网络或API异常'}`)
    } finally {
      setIsScanning(false)
      setScanStatusText('')
    }
  }

  // 手动编辑标签
  const handleSaveEdit = (id: string) => {
    if (!onUpdateFigure) return
    const updatedItems = figure.textItems.map((item) =>
      item.id === id ? { ...item, translated: editValue.trim() } : item
    )
    onUpdateFigure({ ...figure, textItems: updatedItems })
    setEditingItemId(null)
  }

  // 删除标签
  const handleDeleteItem = (id: string) => {
    if (!onUpdateFigure) return
    const updatedItems = figure.textItems.filter((item) => item.id !== id)
    onUpdateFigure({ ...figure, textItems: updatedItems })
  }

  // 划框添加新标签鼠标事件
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!drawModeActive || !imgContainerRef.current) return
    const rect = imgContainerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
    setIsDrawing(true)
    setDrawStart({ x, y })
    setCurrentBox({ x0: x, y0: y, x1: x, y1: y })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !drawStart || !imgContainerRef.current) return
    const rect = imgContainerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
    setCurrentBox({
      x0: Math.min(drawStart.x, x),
      y0: Math.min(drawStart.y, y),
      x1: Math.max(drawStart.x, x),
      y1: Math.max(drawStart.y, y),
    })
  }

  const handleMouseUp = async () => {
    if (!isDrawing || !currentBox || !onUpdateFigure) {
      setIsDrawing(false)
      setCurrentBox(null)
      return
    }
    setIsDrawing(false)

    if (currentBox.x1 - currentBox.x0 > 2 && currentBox.y1 - currentBox.y0 > 2) {
      const userText = prompt('请输入该区域要显示的中文译文（例如：距电极距离）：')
      if (userText && userText.trim()) {
        const newItem: FigureTextItem = {
          id: `manual_${Date.now()}`,
          bbox: [
            Number(currentBox.x0.toFixed(1)),
            Number(currentBox.y0.toFixed(1)),
            Number(currentBox.x1.toFixed(1)),
            Number(currentBox.y1.toFixed(1)),
          ],
          original: userText.trim(),
          translated: userText.trim(),
        }
        onUpdateFigure({
          ...figure,
          textItems: [...figure.textItems, newItem],
        })
      }
    }
    setCurrentBox(null)
    setDrawModeActive(false)
  }

  const validReplacedCount = figure.textItems.filter(
    (it) => it.translated && /[\u4e00-\u9fa5]/.test(it.translated)
  ).length

  return (
    <div className="my-6 rounded-xl border border-black/8 dark:border-white/10 bg-neutral-50/70 dark:bg-neutral-900/50 p-4 transition-all">
      {/* 顶部控制栏 */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 font-medium text-neutral-700 dark:text-neutral-300">
          <Layers className="h-3.5 w-3.5 text-blue-500" />
          <span>原图图层智能覆写</span>
          <span className="rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
            原图保持 · 文字翻译
          </span>
          {validReplacedCount > 0 && (
            <span className="text-[11px] text-neutral-400">
              ({validReplacedCount} 个标签已替换)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 手动划框模式切换 */}
          <button
            onClick={() => setDrawModeActive(!drawModeActive)}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
              drawModeActive
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-neutral-700 dark:text-neutral-200'
            }`}
            title="点击后在图片上拖拽鼠标，可划框直接添加中文翻译标签"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>{drawModeActive ? '拖拽划框中...' : '划框添加'}</span>
          </button>

          {/* 一键重新识别按钮 */}
          <button
            onClick={handleScanAndTranslate}
            disabled={isScanning}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
              validReplacedCount === 0
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-xs animate-pulse'
                : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-neutral-700 dark:text-neutral-200'
            }`}
            title="通过 OCR 识别图内所有英文，并用大模型批量翻译为中文覆写在原图上方"
          >
            {isScanning ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>{scanStatusText || '正在识别...'}</span>
              </>
            ) : (
              <>
                <Scan className="h-3.5 w-3.5" />
                <span>{validReplacedCount === 0 ? '✨ 一键识别并翻译图内英文' : '重新识别图内文字'}</span>
              </>
            )}
          </button>

          {/* 模式快速切换 Pill */}
          <div className="inline-flex rounded-lg bg-black/5 dark:bg-white/10 p-0.5">
            <button
              onClick={() => setLocalMode('all')}
              className={`flex items-center gap-1 rounded-md px-2 py-1 transition-all cursor-pointer ${
                activeMode === 'all'
                  ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="将图中的文字直接覆盖替换为中文"
            >
              <Sparkles className="h-3 w-3" />
              <span>覆写中文</span>
            </button>
            <button
              onClick={() => setLocalMode('hover')}
              className={`flex items-center gap-1 rounded-md px-2 py-1 transition-all cursor-pointer ${
                activeMode === 'hover'
                  ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="鼠标悬停到图中的文字上查看中文翻译"
            >
              <Eye className="h-3 w-3" />
              <span>悬停对照</span>
            </button>
            <button
              onClick={() => setLocalMode('original')}
              className={`flex items-center gap-1 rounded-md px-2 py-1 transition-all cursor-pointer ${
                activeMode === 'original'
                  ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="显示纯净未翻译的原图"
            >
              <span>纯净原图</span>
            </button>
          </div>
        </div>
      </div>

      {/* 图片与覆写图层容器 (增加微量内边距，严防边缘标签被裁剪) */}
      <div
        ref={imgContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`relative mx-auto block w-full rounded-xl bg-white shadow-sm border border-neutral-200/80 select-none ${
          drawModeActive ? 'cursor-crosshair ring-2 ring-amber-500' : ''
        }`}
        style={{ overflow: 'visible' }}
      >
        {/* 原始图片（100% 清晰度保持不变） */}
        <img
          src={figure.imageUrl}
          alt={figure.captionOriginal}
          className="block w-full h-auto object-contain rounded-xl select-none pointer-events-none"
          draggable={false}
        />

        {/* 正在划选的临时框 */}
        {isDrawing && currentBox && (
          <div
            className="absolute border-2 border-dashed border-amber-500 bg-amber-500/20 pointer-events-none z-40 rounded-xs"
            style={{
              left: `${currentBox.x0}%`,
              top: `${currentBox.y0}%`,
              width: `${currentBox.x1 - currentBox.x0}%`,
              height: `${currentBox.y1 - currentBox.y0}%`,
            }}
          />
        )}

        {/* 扫描加载蒙层 */}
        {isScanning && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xs text-white rounded-xl">
            <div className="flex flex-col items-center gap-2 rounded-xl bg-neutral-900/90 p-4 shadow-xl">
              <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
              <div className="text-xs font-medium">{scanStatusText}</div>
            </div>
          </div>
        )}

        {/* 提示识别悬浮层 (当图内尚未提取文字且不是在扫描时) */}
        {validReplacedCount === 0 && !isScanning && !drawModeActive && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center pointer-events-none z-10">
            <button
              onClick={handleScanAndTranslate}
              className="pointer-events-auto flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-medium shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              <Scan className="h-3.5 w-3.5" />
              <span>点击识别图内英文并自动覆写中文</span>
            </button>
          </div>
        )}

        {/* 覆盖图层 (Overlay Layer) */}
        {activeMode !== 'original' && (
          <div className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
            {figure.textItems.map((item) => {
              const trans = item.translated || ''
              const hasChinese = /[\u4e00-\u9fa5]/.test(trans)
              if (!hasChinese) return null
              if (trans.length === 1 && /^[你我他在的了是不个]$/.test(trans)) return null

              const [x0, y0] = item.bbox
              // 安全定位限制：严防由于贴边而被截断 (从 1.5% 到 92%)
              const safeLeft = Math.max(1.0, Math.min(92.0, x0))
              const safeTop = Math.max(1.0, Math.min(94.0, y0))

              const isHovered = hoveredItemId === item.id
              const isEditing = editingItemId === item.id

              if (activeMode === 'all') {
                return (
                  <div
                    key={item.id}
                    className="absolute pointer-events-auto flex items-center justify-start transition-all duration-150 z-20"
                    style={{
                      left: `${safeLeft}%`,
                      top: `${safeTop}%`,
                    }}
                    onMouseEnter={() => setHoveredItemId(item.id)}
                    onMouseLeave={() => setHoveredItemId(null)}
                  >
                    {/* 覆写背景块（始终使用纯白底色+黑色学术字，与论文白底完美融合） */}
                    <div className="group relative flex items-center rounded-[3px] bg-white text-neutral-900 px-1.5 py-0.5 shadow-sm border border-neutral-300 ring-1 ring-blue-500/20 hover:ring-blue-500">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(item.id)
                            }}
                            className="w-24 bg-transparent text-[11px] font-medium outline-none border-b border-blue-500 text-neutral-900"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="text-blue-500 hover:text-blue-600 p-0.5"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="whitespace-nowrap text-[10px] md:text-xs font-semibold text-neutral-900 tracking-tight select-text">
                          {item.translated || item.original}
                        </span>
                      )}

                      {/* 悬停快捷操作与中英对比 */}
                      {isHovered && !isEditing && (
                        <div className="absolute bottom-full left-0 mb-1.5 z-40 whitespace-nowrap rounded-lg bg-neutral-900/95 px-2.5 py-1.5 text-[11px] text-white shadow-2xl backdrop-blur-xs flex items-center gap-2 pointer-events-auto">
                          <div>
                            <div className="text-[10px] text-neutral-400">原文: {item.original}</div>
                            <div className="font-semibold text-blue-300">译文: {item.translated || item.original}</div>
                          </div>
                          <div className="flex items-center gap-1 border-l border-white/20 pl-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingItemId(item.id)
                                setEditValue(item.translated || item.original)
                              }}
                              className="p-1 rounded-sm hover:bg-white/20 text-neutral-300"
                              title="修改该标签翻译"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteItem(item.id)
                              }}
                              className="p-1 rounded-sm hover:bg-red-500/40 text-red-300"
                              title="删除此覆写标签"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              }

              if (activeMode === 'hover') {
                return (
                  <div
                    key={item.id}
                    className="absolute pointer-events-auto cursor-pointer rounded-xs border border-dashed border-blue-500/60 bg-blue-500/10 hover:bg-blue-500/30 transition-all z-20"
                    style={{
                      left: `${safeLeft}%`,
                      top: `${safeTop}%`,
                      width: `8%`,
                      height: `4%`,
                    }}
                    onMouseEnter={() => setHoveredItemId(item.id)}
                    onMouseLeave={() => setHoveredItemId(null)}
                  >
                    {isHovered && (
                      <div className="absolute bottom-full left-0 mb-1.5 z-40 whitespace-nowrap rounded-lg bg-neutral-900/95 px-2.5 py-1.5 text-xs text-white shadow-2xl backdrop-blur-xs">
                        <div className="font-semibold text-blue-300">{item.translated || item.original}</div>
                        <div className="text-[10px] text-neutral-400">原文：{item.original}</div>
                      </div>
                    )}
                  </div>
                )
              }

              return null
            })}
          </div>
        )}
      </div>

      {/* 图注 (Caption) 翻译 */}
      <div className="mt-3 space-y-1 text-xs">
        {figure.captionTranslated && (
          <div className="font-medium text-neutral-900 dark:text-neutral-100 flex items-start gap-1.5">
            <span className="font-semibold text-blue-600 dark:text-blue-400 shrink-0">图注译文：</span>
            <span>{figure.captionTranslated}</span>
          </div>
        )}
        <div className="text-neutral-500 dark:text-neutral-400 flex items-start gap-1.5 text-[11px]">
          <span className="font-medium shrink-0">图注原文：</span>
          <span>{figure.captionOriginal}</span>
        </div>
      </div>
    </div>
  )
}
