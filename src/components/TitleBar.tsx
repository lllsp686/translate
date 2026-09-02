import type { APIProvider, ViewLayoutMode } from '../types'
import { APIService } from '../services/apiService'
import { 
  Columns, FileText, Settings, Play, Sparkles, 
  Moon, Sun, FileUp
} from 'lucide-react'

interface TitleBarProps {
  documentTitle: string
  activeProvider: APIProvider
  layoutMode: ViewLayoutMode
  onLayoutModeChange: (mode: ViewLayoutMode) => void
  onOpenSettings: () => void
  onStartFullTranslate: () => void
  onOpenFilePicker: () => void
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
  isTranslating,
  translateProgress,
  darkMode,
  onToggleDarkMode,
}) => {
  const configs = APIService.getConfigs()
  const currentConfig = configs[activeProvider]

  return (
    <header className="relative flex h-12 w-full items-center justify-between border-b border-black/8 dark:border-white/10 bg-white/80 dark:bg-[#202023]/80 backdrop-blur-xl px-4 select-none z-30 transition-colors">
      {/* 左侧：macOS 红黄绿灯 + 打开文件 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/40 shadow-xs cursor-pointer hover:opacity-80 transition-opacity" />
          <div className="h-3 w-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/40 shadow-xs cursor-pointer hover:opacity-80 transition-opacity" />
          <div className="h-3 w-3 rounded-full bg-[#27c93f] border border-[#1aab29]/40 shadow-xs cursor-pointer hover:opacity-80 transition-opacity" />
        </div>

        <div className="h-4 w-[1px] bg-black/10 dark:bg-white/10 mx-1" />

        <button
          onClick={onOpenFilePicker}
          className="flex items-center gap-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-200 transition-all cursor-pointer"
          title="打开本地 PDF 文献"
        >
          <FileUp className="h-3.5 w-3.5 text-blue-500" />
          <span>导入 PDF</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300 font-medium truncate max-w-[200px] xl:max-w-[320px]">
          <span className="truncate">{documentTitle}</span>
        </div>
      </div>

      {/* 中间：视图布局切换 & 图表覆写模式 */}
      <div className="flex items-center gap-3">
        {/* 阅读布局 Pill */}
        <div className="inline-flex rounded-lg bg-black/5 dark:bg-white/10 p-0.5 text-xs">
          <button
            onClick={() => onLayoutModeChange('bilingual-split')}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-all ${
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
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-all ${
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
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-all ${
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
      </div>

      {/* 右侧：模型徽章 + 全文翻译 + 设置 + 主题切换 */}
      <div className="flex items-center gap-2">
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
