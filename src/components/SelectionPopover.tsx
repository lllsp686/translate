import React, { useState, useEffect } from 'react'
import type { HighlightColor } from '../types'
import { APIService } from '../services/apiService'
import { BookmarkPlus, X, Check, Loader2 } from 'lucide-react'

interface SelectionPopoverProps {
  text: string
  blockId: string
  position: { x: number; y: number }
  onClose: () => void
  onAddToGlossary: (source: string, target: string) => void
  onAddHighlight: (blockId: string, text: string, color: HighlightColor, note?: string) => void
}

export const SelectionPopover: React.FC<SelectionPopoverProps> = ({
  text,
  blockId,
  position,
  onClose,
  onAddToGlossary,
  onAddHighlight,
}) => {
  const [loading, setLoading] = useState(true)
  const [translationData, setTranslationData] = useState<{
    translation: string
    phonetics?: string
    pos?: string
  }>({ translation: '' })
  const [addedGlossary, setAddedGlossary] = useState(false)
  const [noteInput, setNoteInput] = useState('')
  const [showNoteBox, setShowNoteBox] = useState(false)

  useEffect(() => {
    let isCancelled = false
    setLoading(true)

    APIService.translateSelection(text)
      .then((res) => {
        if (!isCancelled) {
          setTranslationData(res)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setTranslationData({ translation: '释义查询失败' })
          setLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [text])

  const handleSaveGlossary = () => {
    if (!translationData.translation) return
    onAddToGlossary(text.trim(), translationData.translation)
    setAddedGlossary(true)
  }

  const handleHighlight = (color: HighlightColor) => {
    onAddHighlight(blockId, text.trim(), color, noteInput.trim() || undefined)
    onClose()
  }

  // 计算屏幕防溢出坐标
  const style: React.CSSProperties = {
    left: Math.min(Math.max(16, position.x - 140), window.innerWidth - 320),
    top: Math.max(16, position.y - 120),
  }

  return (
    <div
      style={style}
      className="fixed z-50 w-72 rounded-2xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-[#222226]/95 p-3 shadow-2xl backdrop-blur-2xl text-xs animate-in fade-in zoom-in-95 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 头部：选中文本 + 关闭 */}
      <div className="flex items-start justify-between gap-2 border-b border-black/5 dark:border-white/5 pb-2">
        <div className="flex-1 truncate">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
            {text.length > 25 ? `${text.slice(0, 25)}...` : text}
          </span>
          {translationData.phonetics && (
            <span className="ml-1.5 text-[11px] text-neutral-400 font-mono">
              {translationData.phonetics}
            </span>
          )}
          {translationData.pos && (
            <span className="ml-1 rounded-sm bg-neutral-100 dark:bg-neutral-800 px-1 text-[10px] text-neutral-500 font-medium">
              {translationData.pos}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 释义区 */}
      <div className="py-2.5 min-h-[36px]">
        {loading ? (
          <div className="flex items-center gap-1.5 text-neutral-400 py-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
            <span>AI 学术词典速查中...</span>
          </div>
        ) : (
          <div className="text-neutral-800 dark:text-neutral-200 leading-relaxed font-medium text-[13px]">
            {translationData.translation}
          </div>
        )}
      </div>

      {/* 批注笔记输入框 */}
      {showNoteBox && (
        <div className="mb-2">
          <input
            type="text"
            placeholder="写下关于此句的科研思考..."
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-2 py-1 text-xs outline-hidden"
          />
        </div>
      )}

      {/* 底部操作条：荧光笔划线 + 收录至术语库 */}
      <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-2">
        {/* 4色荧光划线 */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-neutral-400 mr-0.5">高亮:</span>
          <button
            onClick={() => handleHighlight('yellow')}
            className="h-4 w-4 rounded-full bg-amber-400 hover:scale-115 transition-transform shadow-xs cursor-pointer"
            title="黄色重点"
          />
          <button
            onClick={() => handleHighlight('green')}
            className="h-4 w-4 rounded-full bg-emerald-400 hover:scale-115 transition-transform shadow-xs cursor-pointer"
            title="绿色数据"
          />
          <button
            onClick={() => handleHighlight('blue')}
            className="h-4 w-4 rounded-full bg-sky-400 hover:scale-115 transition-transform shadow-xs cursor-pointer"
            title="蓝色结论"
          />
          <button
            onClick={() => handleHighlight('purple')}
            className="h-4 w-4 rounded-full bg-rose-400 hover:scale-115 transition-transform shadow-xs cursor-pointer"
            title="粉色疑问"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowNoteBox(!showNoteBox)}
            className="text-[10px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 hover:underline cursor-pointer"
          >
            {showNoteBox ? '取消批注' : '添加批注'}
          </button>

          {/* 收录术语库按钮 */}
          <button
            onClick={handleSaveGlossary}
            disabled={addedGlossary || loading}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-all ${
              addedGlossary
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
            }`}
          >
            {addedGlossary ? (
              <>
                <Check className="h-3 w-3" />
                <span>已收录</span>
              </>
            ) : (
              <>
                <BookmarkPlus className="h-3 w-3" />
                <span>存入生词本</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
