import React, { useState, useRef, useEffect } from 'react'
import type { 
  APIProvider, PaperDocument, ViewLayoutMode, 
  HighlightColor, HighlightItem, PaperSummary, ChatMessage 
} from './types'
import { APIService } from './services/apiService'
import { LocalStorageDB } from './services/storageService'
import { ExportService } from './services/exportService'
import { parsePdfFileInBrowser, SAMPLE_TRANSFORMER_PAPER } from './services/documentParser'
import { TitleBar } from './components/TitleBar'
import { Sidebar } from './components/Sidebar'
import { SplitReader } from './components/SplitReader'
import { AICopilotDrawer } from './components/AICopilotDrawer'
import { APISettingsModal } from './components/APISettingsModal'

export const App: React.FC = () => {
  const [documents, setDocuments] = useState<PaperDocument[]>([SAMPLE_TRANSFORMER_PAPER])
  const [currentDocId, setCurrentDocId] = useState<string>(SAMPLE_TRANSFORMER_PAPER.id)
  const [categories, setCategories] = useState<string[]>(['默认分类', '精读文献', '综述论文', '实验参考'])
  const [selectedCategory, setSelectedCategory] = useState<string>('全部')
  const [activeProvider, setActiveProvider] = useState<APIProvider>(() => APIService.getActiveProvider())
  
  const [layoutMode, setLayoutMode] = useState<ViewLayoutMode>('bilingual-split')
  const [syncScroll, setSyncScroll] = useState<boolean>(true)
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false)
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

  // 1. 初始化从 IndexedDB 加载历史文献与分类配置
  useEffect(() => {
    const initStorage = async () => {
      try {
        const [storedDocs, storedCategories, lastDocId] = await Promise.all([
          LocalStorageDB.getAllDocuments(),
          LocalStorageDB.getCategories(),
          LocalStorageDB.getLastActiveDocId(),
        ])

        if (storedCategories && storedCategories.length > 0) {
          setCategories(storedCategories)
        }

        if (storedDocs && storedDocs.length > 0) {
          setDocuments(storedDocs)
          if (lastDocId && storedDocs.some((d) => d.id === lastDocId)) {
            setCurrentDocId(lastDocId)
          } else {
            setCurrentDocId(storedDocs[0].id)
          }
        } else {
          // 首次使用持久化保存示例论文
          await LocalStorageDB.saveDocument(SAMPLE_TRANSFORMER_PAPER)
        }
      } catch (err) {
        console.warn('Init local storage error:', err)
      }
    }

    initStorage()
  }, [])

  // 同步 dark 模式到 HTML 根标签
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const currentDoc = documents.find((d) => d.id === currentDocId) || documents[0] || SAMPLE_TRANSFORMER_PAPER

  // 选择文献
  const handleSelectDoc = (id: string) => {
    setCurrentDocId(id)
    LocalStorageDB.setLastActiveDocId(id)
  }

  // 更新当前文档的某个块并持久化同步至 IndexedDB
  const updateBlock = (blockId: string, updates: Partial<(typeof currentDoc.blocks)[0]>) => {
    setDocuments((prevDocs) => {
      return prevDocs.map((doc) => {
        if (doc.id !== currentDoc.id) return doc
        const updatedDoc = {
          ...doc,
          updatedAt: Date.now(),
          blocks: doc.blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b)),
        }
        LocalStorageDB.saveDocument(updatedDoc)
        return updatedDoc
      })
    })
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
                if (!cell.original.trim() || /^[\d\.\,\%\+\-\=]+$/.test(cell.original)) {
                  return { ...cell, translated: cell.original }
                }
                try {
                  const trans = await APIService.translateText({
                    text: cell.original,
                    config,
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
        // 文本、段落、标题等翻译
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

  // 本地 PDF 导入处理（导入后自动持久化到本地 IndexedDB）
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsParsingPdf(true)
    try {
      const parsed = await parsePdfFileInBrowser(file)
      parsed.category = selectedCategory === '全部' ? '默认分类' : selectedCategory
      
      await LocalStorageDB.saveDocument(parsed)
      await LocalStorageDB.setLastActiveDocId(parsed.id)

      setDocuments((prev) => [parsed, ...prev])
      setCurrentDocId(parsed.id)
      console.log(`[PaperLens] 文献解析完成并已持久化保存，共提取 ${parsed.blocks.length} 块内容`)
    } catch (err: any) {
      alert(`解析 PDF 失败: ${err.message || '未知错误'}`)
    } finally {
      setIsParsingPdf(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // 删除单篇文献
  const handleDeleteDoc = async (id: string) => {
    await LocalStorageDB.deleteDocument(id)
    setDocuments((prev) => {
      const filtered = prev.filter((d) => d.id !== id)
      if (currentDocId === id && filtered.length > 0) {
        setCurrentDocId(filtered[0].id)
        LocalStorageDB.setLastActiveDocId(filtered[0].id)
      }
      return filtered
    })
  }

  // 新增分类
  const handleAddCategory = async (catName: string) => {
    if (categories.includes(catName)) return
    const updated = [...categories, catName]
    setCategories(updated)
    await LocalStorageDB.saveCategories(updated)
  }

  // 删除分类
  const handleDeleteCategory = async (catName: string) => {
    const updated = categories.filter((c) => c !== catName)
    setCategories(updated)
    await LocalStorageDB.saveCategories(updated)
    if (selectedCategory === catName) {
      setSelectedCategory('全部')
    }

    // 该分类下的文献重置为默认分类
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.category === catName) {
          const mod = { ...doc, category: '默认分类', updatedAt: Date.now() }
          LocalStorageDB.saveDocument(mod)
          return mod
        }
        return doc
      })
    )
  }

  // 修改文献所属分类
  const handleChangeDocCategory = async (docId: string, newCategory: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === docId) {
          const mod = { ...doc, category: newCategory, updatedAt: Date.now() }
          LocalStorageDB.saveDocument(mod)
          return mod
        }
        return doc
      })
    )
  }

  // 划词快捷加入生词/术语库
  const handleAddToGlossary = (source: string, target: string) => {
    const currentGlossary = APIService.getGlossary()
    if (!currentGlossary.some((g) => g.source.toLowerCase() === source.toLowerCase())) {
      const updated = [
        ...currentGlossary,
        { id: Date.now().toString(), source, target, domain: '划词释义' },
      ]
      APIService.saveGlossary(updated)
    }
  }

  // 添加高亮划线与批注
  const handleAddHighlight = (blockId: string, text: string, color: HighlightColor, note?: string) => {
    const newHighlight: HighlightItem = {
      id: Date.now().toString(),
      blockId,
      text,
      color,
      note,
      createdAt: Date.now(),
    }

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== currentDoc.id) return doc
        const updatedDoc = {
          ...doc,
          highlights: [...(doc.highlights || []), newHighlight],
          updatedAt: Date.now(),
        }
        LocalStorageDB.saveDocument(updatedDoc)
        return updatedDoc
      })
    )
  }

  // 更新论文四维速读
  const handleUpdateDocumentSummary = (summary: PaperSummary) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== currentDoc.id) return doc
        const updatedDoc = {
          ...doc,
          paperSummary: summary,
          updatedAt: Date.now(),
        }
        LocalStorageDB.saveDocument(updatedDoc)
        return updatedDoc
      })
    )
  }

  // 更新论文伴读问答历史
  const handleUpdateChatHistory = (messages: ChatMessage[]) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== currentDoc.id) return doc
        const updatedDoc = {
          ...doc,
          chatHistory: messages,
          updatedAt: Date.now(),
        }
        LocalStorageDB.saveDocument(updatedDoc)
        return updatedDoc
      })
    )
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
        onExportMarkdown={() => ExportService.exportToMarkdown(currentDoc)}
        onExportHTML={() => ExportService.exportToHTML(currentDoc)}
        syncScroll={syncScroll}
        onToggleSyncScroll={() => setSyncScroll(!syncScroll)}
        isCopilotOpen={isCopilotOpen}
        onToggleCopilot={() => setIsCopilotOpen(!isCopilotOpen)}
        isTranslating={isTranslating}
        translateProgress={translateProgress}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* 主阅读视口区域 */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* 左侧抽屉边栏（支持分类管理与持久化文献库） */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          documents={documents}
          currentDocId={currentDoc.id}
          onSelectDoc={handleSelectDoc}
          onImportFile={() => fileInputRef.current?.click()}
          onOpenSettings={() => setIsSettingsOpen(true)}
          activeProvider={activeProvider}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          onChangeDocCategory={handleChangeDocCategory}
          onDeleteDoc={handleDeleteDoc}
        />

        {/* 双栏对照高保真阅读器 */}
        <main className="flex-1 h-full overflow-hidden">
          <SplitReader
            document={currentDoc}
            layoutMode={layoutMode}
            onTranslateBlock={handleTranslateBlock}
            activeBlockId={activeBlockId}
            onSetActiveBlockId={setActiveBlockId}
            syncScroll={syncScroll}
            onAddToGlossary={handleAddToGlossary}
            onAddHighlight={handleAddHighlight}
          />
        </main>

        {/* AI 论文伴读与四维速读 Copilot 抽屉 */}
        <AICopilotDrawer
          isOpen={isCopilotOpen}
          onClose={() => setIsCopilotOpen(false)}
          document={currentDoc}
          onUpdateDocumentSummary={handleUpdateDocumentSummary}
          onUpdateChatHistory={handleUpdateChatHistory}
        />
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
