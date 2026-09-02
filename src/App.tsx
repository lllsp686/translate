import React, { useState, useRef, useEffect } from 'react'
import type { APIProvider, PaperDocument, ViewLayoutMode } from './types'
import { APIService } from './services/apiService'
import { parsePdfFileInBrowser, SAMPLE_TRANSFORMER_PAPER } from './services/documentParser'
import { TitleBar } from './components/TitleBar'
import { Sidebar } from './components/Sidebar'
import { SplitReader } from './components/SplitReader'
import { APISettingsModal } from './components/APISettingsModal'

export const App: React.FC = () => {
  const [documents, setDocuments] = useState<PaperDocument[]>([SAMPLE_TRANSFORMER_PAPER])
  const [currentDocId, setCurrentDocId] = useState<string>(SAMPLE_TRANSFORMER_PAPER.id)
  const [activeProvider, setActiveProvider] = useState<APIProvider>(() => APIService.getActiveProvider())
  
  const [layoutMode, setLayoutMode] = useState<ViewLayoutMode>('bilingual-split')
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false)
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const [isTranslating, setIsTranslating] = useState<boolean>(false)
  const [translateProgress, setTranslateProgress] = useState<{ completed: number; total: number }>({
    completed: 0,
    total: 0,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  // 同步 dark 模式到 HTML 根标签
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const currentDoc = documents.find((d) => d.id === currentDocId) || documents[0]

  // 更新当前文档的某个块
  const updateBlock = (blockId: string, updates: Partial<(typeof currentDoc.blocks)[0]>) => {
    setDocuments((prevDocs) =>
      prevDocs.map((doc) => {
        if (doc.id !== currentDoc.id) return doc
        return {
          ...doc,
          updatedAt: Date.now(),
          blocks: doc.blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b)),
        }
      })
    )
  }

  // 单块翻译
  const handleTranslateBlock = async (blockId: string) => {
    const block = currentDoc.blocks.find((b) => b.id === blockId)
    if (!block) return

    const config = APIService.getConfigs()[activeProvider]
    if (!config.apiKey && config.provider !== 'custom') {
      setIsSettingsOpen(true)
      return
    }

    updateBlock(blockId, { status: 'translating', errorMessage: undefined })

    try {
      if (block.type === 'figure' && block.figureData) {
        // 翻译图注 (Caption)
        const captionTrans = await APIService.translateText({
          text: block.figureData.captionOriginal,
          config,
        })

        updateBlock(blockId, {
          status: 'completed',
          translatedText: captionTrans,
          figureData: {
            ...block.figureData,
            captionTranslated: captionTrans,
          },
        })
      } else if (block.type === 'table' && block.tableData) {
        // 翻译表注
        const captionTrans = await APIService.translateText({
          text: block.tableData.captionOriginal,
          config,
        })

        // 翻译表格单元格
        const updatedRows = await Promise.all(
          block.tableData.rows.map(async (row) => {
            return Promise.all(
              row.map(async (cell) => {
                if (cell.translated) return cell
                if (!cell.original.trim() || /^[\d\.\,\%\-\+\s]+$/.test(cell.original)) {
                  return { ...cell, translated: cell.original }
                }
                try {
                  const trans = await APIService.translateText({
                    text: cell.original,
                    config,
                    systemPrompt: 'Translate this table header/cell to Chinese. Keep numbers and formulas intact. Return only the translation.',
                  })
                  return { ...cell, translated: trans }
                } catch {
                  return cell
                }
              })
            )
          })
        )

        updateBlock(blockId, {
          status: 'completed',
          translatedText: captionTrans,
          tableData: {
            ...block.tableData,
            captionTranslated: captionTrans,
            rows: updatedRows,
          },
        })
      } else {
        // 普通段落/公式/标题
        const trans = await APIService.translateText({
          text: block.originalText,
          config,
        })
        updateBlock(blockId, { status: 'completed', translatedText: trans })
      }
    } catch (err: any) {
      updateBlock(blockId, { status: 'error', errorMessage: err.message || '翻译失败' })
    }
  }

  // 全文顺序并发翻译
  const handleStartFullTranslate = async () => {
    const config = APIService.getConfigs()[activeProvider]
    if (!config.apiKey && config.provider !== 'custom') {
      setIsSettingsOpen(true)
      return
    }

    const uncompleted = currentDoc.blocks.filter((b) => b.status !== 'completed')
    if (uncompleted.length === 0) {
      alert('本篇学术文献全部内容已翻译完成！')
      return
    }

    setIsTranslating(true)
    let completedCount = currentDoc.blocks.length - uncompleted.length
    setTranslateProgress({ completed: completedCount, total: currentDoc.blocks.length })

    for (const block of uncompleted) {
      await handleTranslateBlock(block.id)
      completedCount++
      setTranslateProgress({ completed: completedCount, total: currentDoc.blocks.length })
    }

    setIsTranslating(false)
  }

  const [isParsingPdf, setIsParsingPdf] = useState<boolean>(false)

  // 本地 PDF 导入处理
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsParsingPdf(true)
    try {
      const parsed = await parsePdfFileInBrowser(file)
      const figureCount = parsed.blocks.filter((b) => b.type === 'figure').length
      setDocuments((prev) => [parsed, ...prev])
      setCurrentDocId(parsed.id)
      console.log(`[GreenWhale] 文献解析完成，共提取 ${parsed.blocks.length} 块内容，其中图表数: ${figureCount}`)
    } catch (err: any) {
      alert(`解析 PDF 失败: ${err.message || '未知错误'}`)
    } finally {
      setIsParsingPdf(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#fbfbfd] dark:bg-[#161618] text-neutral-900 dark:text-neutral-100 font-sans">
      {/* 隐藏的 PDF 文件选择器 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 苹果原生质感顶栏 */}
      <TitleBar
        documentTitle={currentDoc.title}
        activeProvider={activeProvider}
        layoutMode={layoutMode}
        onLayoutModeChange={setLayoutMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onStartFullTranslate={handleStartFullTranslate}
        onOpenFilePicker={() => fileInputRef.current?.click()}
        isTranslating={isTranslating}
        translateProgress={translateProgress}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* 主阅读视口区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧抽屉边栏 */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          documents={documents}
          currentDocId={currentDoc.id}
          onSelectDoc={setCurrentDocId}
          onImportFile={() => fileInputRef.current?.click()}
          onOpenSettings={() => setIsSettingsOpen(true)}
          activeProvider={activeProvider}
        />

        {/* 双栏对照高保真阅读器 */}
        <main className="flex-1 h-full overflow-hidden">
          <SplitReader
            document={currentDoc}
            layoutMode={layoutMode}
            onTranslateBlock={handleTranslateBlock}
            activeBlockId={activeBlockId}
            onSetActiveBlockId={setActiveBlockId}
          />
        </main>
      </div>

      {/* API 偏好设置面板 (Sheet Modal) */}
      <APISettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onProviderChanged={(p) => setActiveProvider(p)}
      />

      {/* PDF 深度解析加载指示弹层 */}
      {isParsingPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white dark:bg-neutral-800 p-6 shadow-2xl border border-black/10 dark:border-white/10 max-w-sm text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-500 border-t-transparent" />
            <div>
              <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">正在解析文献与图表...</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                正在使用高精度 Retina 引擎分析版面、定位论文架构图与图表文字
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
