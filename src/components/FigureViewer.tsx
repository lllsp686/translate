import React, { useState } from 'react'
import type { FigureBlockData } from '../types'
import { ZoomIn, X } from 'lucide-react'

interface FigureViewerProps {
  figure: FigureBlockData
}

export const FigureViewer: React.FC<FigureViewerProps> = ({ figure }) => {
  const [isZoomed, setIsZoomed] = useState<boolean>(false)

  return (
    <div className="my-6 rounded-xl border border-black/8 dark:border-white/10 bg-white dark:bg-neutral-900/60 p-4 transition-all shadow-xs">
      {/* 原始图片容器（高清纯净展示，无任何覆写遮挡） */}
      <div className="group relative mx-auto block w-full overflow-hidden rounded-lg bg-white border border-neutral-200/70 dark:border-neutral-800">
        <img
          src={figure.imageUrl}
          alt={figure.captionOriginal}
          className="block w-full h-auto object-contain select-none cursor-zoom-in transition-transform duration-200 group-hover:scale-[1.005]"
          onClick={() => setIsZoomed(true)}
          title="点击查看原图大图"
        />

        {/* 悬停放大提示 */}
        <button
          onClick={() => setIsZoomed(true)}
          className="absolute right-2.5 bottom-2.5 flex items-center gap-1 rounded-md bg-black/60 hover:bg-black/80 px-2 py-1 text-[11px] text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer shadow-md"
        >
          <ZoomIn className="h-3 w-3" />
          <span>查看大图</span>
        </button>
      </div>

      {/* 图注 (Caption) 中英对照翻译 */}
      <div className="mt-3.5 space-y-1.5 text-xs">
        {figure.captionTranslated ? (
          <div className="font-medium text-neutral-900 dark:text-neutral-100 flex items-start gap-1.5 leading-relaxed">
            <span className="font-semibold text-blue-600 dark:text-blue-400 shrink-0 select-none">
              图注译文：
            </span>
            <span>{figure.captionTranslated}</span>
          </div>
        ) : (
          <div className="text-neutral-400 italic text-[11px]">
            （点击上方“全文翻译”或段落翻译按钮即可翻译图注）
          </div>
        )}
        <div className="text-neutral-500 dark:text-neutral-400 flex items-start gap-1.5 text-[11px] leading-relaxed">
          <span className="font-medium shrink-0 select-none text-neutral-400">图注原文：</span>
          <span>{figure.captionOriginal}</span>
        </div>
      </div>

      {/* 大图弹窗 (Lightbox) */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-h-[92vh] max-w-[92vw] overflow-auto rounded-xl bg-white p-2 shadow-2xl">
            <img
              src={figure.imageUrl}
              alt={figure.captionOriginal}
              className="max-h-[85vh] max-w-full object-contain"
            />
            <div className="mt-2 text-center text-xs text-neutral-600 font-medium">
              {figure.captionTranslated || figure.captionOriginal}
            </div>
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-3 right-3 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/90 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
