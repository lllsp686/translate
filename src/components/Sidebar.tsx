import React, { useState } from 'react'
import type { APIProvider, GlossaryItem, PaperDocument } from '../types'
import { APIService } from '../services/apiService'
import { 
  BookOpen, Plus, Key, ChevronLeft, ChevronRight, 
  Trash2, FileText, CheckCircle2
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  documents: PaperDocument[]
  currentDocId: string
  onSelectDoc: (id: string) => void
  onImportFile: () => void
  onOpenSettings: () => void
  activeProvider: APIProvider
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  documents,
  currentDocId,
  onSelectDoc,
  onImportFile,
  onOpenSettings,
  activeProvider,
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'glossary'>('library')
  const [glossary, setGlossary] = useState<GlossaryItem[]>(() => APIService.getGlossary())
  const [newSource, setNewSource] = useState('')
  const [newTarget, setNewTarget] = useState('')

  const configs = APIService.getConfigs()
  const currentConfig = configs[activeProvider]

  const handleAddGlossary = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSource.trim() || !newTarget.trim()) return
    const updated = [
      ...glossary,
      { id: Date.now().toString(), source: newSource.trim(), target: newTarget.trim(), domain: '自定义' },
    ]
    setGlossary(updated)
    APIService.saveGlossary(updated)
    setNewSource('')
    setNewTarget('')
  }

  const handleDeleteGlossary = (id: string) => {
    const updated = glossary.filter((g) => g.id !== id)
    setGlossary(updated)
    APIService.saveGlossary(updated)
  }

  if (!isOpen) {
    return (
      <div className="flex h-full flex-col items-center border-r border-black/8 dark:border-white/8 bg-neutral-100/70 dark:bg-[#1a1a1c]/80 backdrop-blur-xl py-3 px-1 w-10 shrink-0 select-none z-20">
        <button
          onClick={onToggle}
          className="rounded-lg p-1.5 text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          title="展开侧边栏"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <aside className="relative flex h-full w-64 flex-col justify-between border-r border-black/8 dark:border-white/8 bg-neutral-50/80 dark:bg-[#1a1a1c]/85 backdrop-blur-2xl select-none z-20 transition-all">
      {/* 顶部标签栏 */}
      <div className="flex flex-col p-3">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-1.5 font-semibold text-xs text-neutral-800 dark:text-neutral-200">
            <BookOpen className="h-4 w-4 text-blue-500" />
            <span>文献智译工作台</span>
          </div>
          <button
            onClick={onToggle}
            className="rounded-md p-1 text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            title="收起侧边栏"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* 切换 Tab */}
        <div className="grid grid-cols-2 rounded-lg bg-black/5 dark:bg-white/5 p-0.5 text-xs mt-1">
          <button
            onClick={() => setActiveTab('library')}
            className={`rounded-md py-1 font-medium transition-all ${
              activeTab === 'library'
                ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
            }`}
          >
            我的文献库
          </button>
          <button
            onClick={() => setActiveTab('glossary')}
            className={`rounded-md py-1 font-medium transition-all ${
              activeTab === 'glossary'
                ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
            }`}
          >
            术语库 ({glossary.length})
          </button>
        </div>
      </div>

      {/* 主体列表区 */}
      <div className="flex-1 overflow-y-auto px-3 py-1">
        {activeTab === 'library' ? (
          <div className="space-y-1.5">
            <button
              onClick={onImportFile}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-blue-500/40 bg-blue-500/5 hover:bg-blue-500/10 p-2.5 text-xs font-medium text-blue-600 dark:text-blue-400 transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>导入新文献 (PDF)</span>
            </button>

            <div className="pt-2 text-[11px] font-semibold text-neutral-400 px-1">
              文献列表 ({documents.length})
            </div>

            <div className="space-y-1">
              {documents.map((doc) => {
                const isSelected = currentDocId === doc.id
                const completedBlocks = doc.blocks.filter((b) => b.status === 'completed').length
                const totalBlocks = doc.blocks.length
                const percent = Math.round((completedBlocks / totalBlocks) * 100)

                return (
                  <button
                    key={doc.id}
                    onClick={() => onSelectDoc(doc.id)}
                    className={`group flex w-full flex-col rounded-xl p-2.5 text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex items-center gap-1.5 font-medium truncate">
                        <FileText className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-blue-500' : 'text-neutral-400'}`} />
                        <span className="truncate">{doc.title}</span>
                      </div>
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-neutral-400">
                      <span>{doc.pageCount} 页 · {(doc.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                      <span className="flex items-center gap-1">
                        {percent === 100 ? (
                          <span className="text-emerald-500 font-medium flex items-center gap-0.5">
                            <CheckCircle2 className="h-2.5 w-2.5" /> 已全译
                          </span>
                        ) : (
                          <span>{percent}%</span>
                        )}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          /* 术语表 Tab */
          <div className="space-y-3">
            <form onSubmit={handleAddGlossary} className="space-y-2 rounded-xl bg-black/5 dark:bg-white/5 p-2.5">
              <div className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
                新增论文专有术语
              </div>
              <input
                type="text"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                placeholder="英文原词 (如 Transformer)"
                className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900 px-2 py-1 text-xs outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                placeholder="指定中文译词"
                className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900 px-2 py-1 text-xs outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-500 hover:bg-blue-600 py-1 text-xs font-medium text-white transition-colors"
              >
                添加术语
              </button>
            </form>

            <div className="space-y-1">
              {glossary.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg p-2 text-xs hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <div className="truncate">
                    <div className="font-medium text-neutral-800 dark:text-neutral-200 truncate">{item.source}</div>
                    <div className="text-[11px] text-blue-600 dark:text-blue-400 truncate">→ {item.target}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteGlossary(item.id)}
                    className="p-1 text-neutral-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 底部 API 状态卡片 */}
      <div className="p-3 border-t border-black/5 dark:border-white/5">
        <button
          onClick={onOpenSettings}
          className="group flex w-full items-center justify-between rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 p-2.5 text-left transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs">
              <Key className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="text-xs font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-blue-500 transition-colors">
                {currentConfig?.name?.split(' ')[0] || 'DeepSeek'}
              </div>
              <div className="text-[10px] text-neutral-400">
                {currentConfig?.apiKey ? '● 密钥已配置' : '○ 待填入 API Key'}
              </div>
            </div>
          </div>

          <span className="text-[10px] rounded-md bg-white dark:bg-neutral-800 px-1.5 py-0.5 text-neutral-500 dark:text-neutral-400 shadow-xs">
            设置
          </span>
        </button>
      </div>
    </aside>
  )
}
