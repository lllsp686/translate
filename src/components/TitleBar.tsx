import React, { useState } from 'react'
import type { APIProvider, ViewLayoutMode } from '../types'
import { APIService } from '../services/apiService'
import { 
  Columns, FileText, Settings, Play, Sparkles, 
  Moon, Sun, FileUp, Download, Link2, Unlink2, 
  Bot, ChevronDown, Printer
} from 'lucide-react'

interface TitleBarProps {
  documentTitle: string
  activeProvider: APIProvider
  layoutMode: ViewLayoutMode
  onLayoutModeChange: (mode: ViewLayoutMode) => void
  onOpenSettings: () => void
  onStartFullTranslate: () => void
  onOpenFilePicker: () => void
  onExportMarkdown?: () => void
  onExportHTML?: () => void
  syncScroll: boolean
  onToggleSyncScroll: () => void
  isCopilotOpen: boolean
  onToggleCopilot: () => void
  isTranslating: boolean
  translateProgress: { completed: number; total: number }
  darkMode: boolean
  onToggleDarkMode: () => void
}

export const TitleBar: React.FC<TitleBarProps> = ({
  documentTitle,
  activeProvider,
  layoutMode,
  onLayoutModeChange,
  onOpenSettings,
  onStartFullTranslate,
  onOpenFilePicker,
  onExportMarkdown,
  onExportHTML,
  syncScroll,
  onToggleSyncScroll,
  isCopilotOpen,
  onToggleCopilot,
  isTranslating,
  translateProgress,
  darkMode,
  onToggleDarkMode,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false)
  const configs = APIService.getConfigs()
  const currentConfig = configs[activeProvider]

  return (
    <header 
      className="relative flex h-12 w-full items-center justify-between border-b border-black/8 dark:border-white/10 bg-white/80 dark:bg-[#202023]/80 backdrop-blur-xl px-4 select-none z-30 transition-colors"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      {/* 左侧：macOS 原生红黄绿灯留白区 + 打开文件 */}
      <div className="flex items-center gap-2">
        {/* 留出 72px 给 macOS 系统原生交通灯按钮，彻底解决重影与点击无效 */}
        <div className="w-[72px] shrink-0" />

        <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as any}>
          <button
            onClick={onOpenFilePicker}
            className="flex items-center gap-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-200 transition-all cursor-pointer"
            title="打开本地 PDF 文献"
          >
            <FileUp className="h-3.5 w-3.5 text-blue-500" />
            <span>导入 PDF</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300 font-medium truncate max-w-[180px] xl:max-w-[280px]">
            <span className="truncate">{documentTitle}</span>
          </div>
        </div>
      </div>

      {/* 中间：视图布局切换 & 联动滚动开关 */}
      <div className="flex items-center gap-2.5" style={{ WebkitAppRegion: 'no-drag' } as any}>
        {/* 阅读布局 Pill */}
        <div className="inline-flex rounded-lg bg-black/5 dark:bg-white/10 p-0.5 text-xs">
          <button
            onClick={() => onLayoutModeChange('bilingual-split')}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-all cursor-pointer ${
              layoutMode === 'bilingual-split'
                ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
            title="左右双栏分屏对照阅读"
          >
            <Columns className="h-3.5 w-3.5" />
            <span>双栏对照</span>
          </button>
          <button
            onClick={() => onLayoutModeChange('translation-only')}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-all cursor-pointer ${
              layoutMode === 'translation-only'
                ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
            title="单屏纯译文流畅阅读"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>译文纯享</span>
          </button>
          <button
            onClick={() => onLayoutModeChange('original-only')}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-all cursor-pointer ${
              layoutMode === 'original-only'
                ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
            title="单屏纯原文对照"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>原文排版</span>
          </button>
        </div>

        {/* 滚动联动开关 */}
        {layoutMode === 'bilingual-split' && (
          <button
            onClick={onToggleSyncScroll}
            className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs transition-all cursor-pointer ${
              syncScroll
                ? 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium'
                : 'border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 text-neutral-500 hover:text-neutral-800'
            }`}
            title={syncScroll ? '点击关闭双栏滚动联动' : '点击开启双栏平滑滚动联动'}
          >
            {syncScroll ? <Link2 className="h-3.5 w-3.5" /> : <Unlink2 className="h-3.5 w-3.5" />}
            <span>{syncScroll ? '联动对齐' : '自由独立'}</span>
          </button>
        )}
      </div>

      {/* 右侧：AI伴读 + 导出 + 模型 + 全文翻译 + 设置 */}
      <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as any}>
        {/* AI 伴读助手开关按钮 */}
        <button
          onClick={onToggleCopilot}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
            isCopilotOpen
              ? 'border-blue-500 bg-blue-500 text-white shadow-xs'
              : 'border-black/8 dark:border-white/10 bg-black/5 dark:bg-white/5 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10'
          }`}
          title="展开 AI 论文速读与伴读问答"
        >
          <Bot className="h-3.5 w-3.5" />
          <span>AI 伴读</span>
        </button>

        {/* 导出菜单 */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-1 rounded-lg border border-black/8 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-2.5 py-1 text-xs text-neutral-700 dark:text-neutral-300 transition-all cursor-pointer"
            title="导出双语精读笔记"
          >
            <Download className="h-3.5 w-3.5 text-blue-500" />
            <span>导出</span>
            <ChevronDown className="h-3 w-3 text-neutral-400" />
          </button>

          {showExportMenu && (
            <div 
              className="absolute right-0 top-9 z-40 w-48 rounded-xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-neutral-800/95 p-1 shadow-xl backdrop-blur-md text-xs animate-in fade-in"
              onClick={() => setShowExportMenu(false)}
            >
              {onExportMarkdown && (
                <button
                  onClick={onExportMarkdown}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-neutral-700 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-blue-500" />
                  <div>
                    <div className="font-medium">导出 Markdown (.md)</div>
                    <div className="text-[10px] text-neutral-400">保留 LaTeX 数学公式</div>
                  </div>
                </button>
              )}
              {onExportHTML && (
                <button
                  onClick={onExportHTML}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-neutral-700 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5 text-emerald-500" />
                  <div>
                    <div className="font-medium">双语网页 / 打印 PDF</div>
                    <div className="text-[10px] text-neutral-400">独立高保真排版</div>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 当前模型指示器 */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 rounded-lg border border-black/8 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-2.5 py-1 text-xs text-neutral-700 dark:text-neutral-300 transition-all cursor-pointer"
          title="点击更换翻译模型或配置 API Key"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
          <span className="font-medium">{currentConfig?.name?.split(' ')[0] || 'DeepSeek'}</span>
          <span className="text-[10px] text-neutral-400">({currentConfig?.model})</span>
        </button>

        {/* 全文翻译按钮 */}
        <button
          onClick={onStartFullTranslate}
          disabled={isTranslating}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium text-white shadow-xs transition-all ${
            isTranslating
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
          }`}
        >
          {isTranslating ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>
                翻译中 {translateProgress.completed}/{translateProgress.total}
              </span>
            </>
          ) : (
            <>
              <Play className="h-3 w-3 fill-current" />
              <span>全文翻译</span>
            </>
          )}
        </button>

        {/* 设置齿轮 */}
        <button
          onClick={onOpenSettings}
          className="rounded-lg p-1.5 text-neutral-500 hover:bg-black/5 dark:hover:bg-white/10 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          title="API 与系统偏好设置"
        >
          <Settings className="h-4 w-4" />
        </button>

        {/* 明暗模式切换 */}
        <button
          onClick={onToggleDarkMode}
          className="rounded-lg p-1.5 text-neutral-500 hover:bg-black/5 dark:hover:bg-white/10 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          title={darkMode ? '切换到亮色模式' : '切换到深色模式'}
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  )
}
