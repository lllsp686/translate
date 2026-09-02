import React, { useState } from 'react'
import type { APIProvider, GlossaryItem, PaperDocument } from '../types'
import { APIService } from '../services/apiService'
import { 
  BookOpen, Plus, ChevronLeft, ChevronRight, 
  Trash2, FileText, CheckCircle2, Folder, FolderPlus,
  Tag, MoreVertical, X
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
  categories: string[]
  selectedCategory: string
  onSelectCategory: (category: string) => void
  onAddCategory: (category: string) => void
  onDeleteCategory: (category: string) => void
  onChangeDocCategory: (docId: string, category: string) => void
  onDeleteDoc: (docId: string) => void
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
  categories,
  selectedCategory,
  onSelectCategory,
  onAddCategory,
  onDeleteCategory,
  onChangeDocCategory,
  onDeleteDoc,
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'glossary'>('library')
  const [glossary, setGlossary] = useState<GlossaryItem[]>(() => APIService.getGlossary())
  const [newSource, setNewSource] = useState('')
  const [newTarget, setNewTarget] = useState('')
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [activeMenuDocId, setActiveMenuDocId] = useState<string | null>(null)

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

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault()
    const name = newCategoryName.trim()
    if (!name) return
    if (!categories.includes(name)) {
      onAddCategory(name)
    }
    setNewCategoryName('')
    setIsAddingCategory(false)
  }

  const filteredDocs = documents.filter((doc) => {
    if (selectedCategory === '全部') return true
    return (doc.category || '默认分类') === selectedCategory
  })

  if (!isOpen) {
    return (
      <div className="flex h-full flex-col items-center border-r border-black/8 dark:border-white/8 bg-neutral-100/70 dark:bg-[#1a1a1c]/80 backdrop-blur-xl py-3 px-1 w-10 shrink-0 select-none z-20">
        <button
          onClick={onToggle}
          className="rounded-lg p-1.5 text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
          title="展开侧边栏"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <aside className="relative flex h-full w-72 flex-col justify-between border-r border-black/8 dark:border-white/8 bg-neutral-50/80 dark:bg-[#1a1a1c]/85 backdrop-blur-2xl select-none z-20 transition-all">
      {/* 顶部标签栏 */}
      <div className="flex flex-col p-3 pb-2 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-1.5 font-semibold text-xs text-neutral-800 dark:text-neutral-200">
            <BookOpen className="h-4 w-4 text-blue-500" />
            <span>文献智译工作台</span>
          </div>
          <button
            onClick={onToggle}
            className="rounded-md p-1 text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            title="收起侧边栏"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* 切换 Tab */}
        <div className="grid grid-cols-2 rounded-lg bg-black/5 dark:bg-white/5 p-0.5 text-xs mt-1">
          <button
            onClick={() => setActiveTab('library')}
            className={`rounded-md py-1 font-medium transition-all cursor-pointer ${
              activeTab === 'library'
                ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
            }`}
          >
            文献库 ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab('glossary')}
            className={`rounded-md py-1 font-medium transition-all cursor-pointer ${
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
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {activeTab === 'library' ? (
          <div className="space-y-3">
            {/* 导入按钮 */}
            <button
              onClick={onImportFile}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-blue-500/40 bg-blue-500/5 hover:bg-blue-500/10 p-2.5 text-xs font-medium text-blue-600 dark:text-blue-400 transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>导入新文献 (PDF)</span>
            </button>

            {/* 分类 / 文件夹导航区 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400 px-1">
                <span>分类管理</span>
                <button
                  onClick={() => setIsAddingCategory(!isAddingCategory)}
                  className="flex items-center gap-0.5 text-blue-500 hover:text-blue-600 text-[10px] cursor-pointer"
                  title="新建分类文件夹"
                >
                  <FolderPlus className="h-3 w-3" />
                  <span>新建</span>
                </button>
              </div>

              {/* 新建分类输入框 */}
              {isAddingCategory && (
                <form onSubmit={handleCreateCategory} className="flex items-center gap-1 px-1">
                  <input
                    type="text"
                    autoFocus
                    placeholder="分类名称..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2 py-1 text-xs text-neutral-800 dark:text-neutral-200 outline-hidden"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
                  >
                    确定
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(false)}
                    className="rounded-md p-1 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </form>
              )}

              {/* 分类选择胶囊标签 */}
              <div className="flex flex-wrap gap-1 px-0.5">
                <button
                  onClick={() => onSelectCategory('全部')}
                  className={`rounded-lg px-2 py-1 text-[11px] font-medium transition-all cursor-pointer ${
                    selectedCategory === '全部'
                      ? 'bg-blue-500 text-white shadow-xs'
                      : 'bg-black/5 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:bg-black/10'
                  }`}
                >
                  全部 ({documents.length})
                </button>

                {categories.map((cat) => {
                  const count = documents.filter((d) => (d.category || '默认分类') === cat).length
                  const isSelected = selectedCategory === cat

                  return (
                    <div key={cat} className="group relative inline-flex items-center">
                      <button
                        onClick={() => onSelectCategory(cat)}
                        className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-500 text-white shadow-xs'
                            : 'bg-black/5 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:bg-black/10'
                        }`}
                      >
                        <Folder className="h-2.5 w-2.5 opacity-70" />
                        <span>{cat}</span>
                        <span className="opacity-60 text-[9px]">({count})</span>
                      </button>

                      {cat !== '默认分类' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm(`确定删除分类 "${cat}" 吗？该分类下的文献将归为默认分类。`)) {
                              onDeleteCategory(cat)
                            }
                          }}
                          className="hidden group-hover:flex items-center justify-center -ml-1 text-neutral-400 hover:text-rose-500 p-0.5 cursor-pointer"
                          title="删除分类"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 文献卡片列表 */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400 px-1">
                <span>{selectedCategory} 文献 ({filteredDocs.length})</span>
              </div>

              {filteredDocs.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-400">
                  当前分类暂无文献
                </div>
              ) : (
                filteredDocs.map((doc) => {
                  const isSelected = currentDocId === doc.id
                  const completedBlocks = doc.blocks.filter((b) => b.status === 'completed').length
                  const totalBlocks = doc.blocks.length
                  const percent = Math.round((completedBlocks / totalBlocks) * 100)
                  const isMenuOpen = activeMenuDocId === doc.id

                  return (
                    <div key={doc.id} className="relative group">
                      <div
                        onClick={() => onSelectDoc(doc.id)}
                        className={`flex w-full flex-col rounded-xl p-2.5 text-left text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex items-center gap-1.5 font-medium truncate flex-1">
                            <FileText className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-blue-500' : 'text-neutral-400'}`} />
                            <span className="truncate">{doc.title}</span>
                          </div>

                          {/* 菜单操作按钮 */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveMenuDocId(isMenuOpen ? null : doc.id)
                            }}
                            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="文献操作"
                          >
                            <MoreVertical className="h-3 w-3" />
                          </button>
                        </div>

                        {/* 分类标签与进度条 */}
                        <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-400">
                          <div className="flex items-center gap-1">
                            <span className="inline-flex items-center gap-0.5 rounded-md bg-black/5 dark:bg-white/10 px-1.5 py-0.5 text-neutral-600 dark:text-neutral-300">
                              <Tag className="h-2 w-2" />
                              {doc.category || '默认分类'}
                            </span>
                            <span>· {doc.pageCount}页</span>
                          </div>

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
                      </div>

                      {/* 弹出菜单：修改分类、删除 */}
                      {isMenuOpen && (
                        <div 
                          className="absolute right-2 top-8 z-30 w-36 rounded-xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-neutral-800/95 p-1 shadow-lg backdrop-blur-md text-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="px-2 py-1 text-[10px] font-semibold text-neutral-400">
                            移动至分类
                          </div>
                          {categories.map((cat) => (
                            <button
                              key={cat}
                              onClick={() => {
                                onChangeDocCategory(doc.id, cat)
                                setActiveMenuDocId(null)
                              }}
                              className={`flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-[11px] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer ${
                                (doc.category || '默认分类') === cat ? 'text-blue-500 font-medium' : 'text-neutral-700 dark:text-neutral-300'
                              }`}
                            >
                              <Folder className="h-3 w-3" />
                              <span className="truncate">{cat}</span>
                            </button>
                          ))}

                          <div className="my-1 h-[1px] bg-black/5 dark:bg-white/5" />

                          <button
                            onClick={() => {
                              if (confirm(`确定删除文献 "${doc.title}" 吗？删除后不可恢复。`)) {
                                onDeleteDoc(doc.id)
                              }
                              setActiveMenuDocId(null)
                            }}
                            className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-[11px] text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>删除文献</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
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
                placeholder="英文术语 (如 Self-Attention)"
                className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white/50 dark:bg-neutral-800/50 px-2.5 py-1 text-xs text-neutral-800 dark:text-neutral-200 focus:border-blue-500 focus:outline-hidden"
              />
              <input
                type="text"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                placeholder="统一译名 (如 自注意力机制)"
                className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white/50 dark:bg-neutral-800/50 px-2.5 py-1 text-xs text-neutral-800 dark:text-neutral-200 focus:border-blue-500 focus:outline-hidden"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-500 hover:bg-blue-600 py-1 text-xs font-medium text-white shadow-xs transition-colors cursor-pointer"
              >
                收录至专业词库
              </button>
            </form>

            <div className="space-y-1">
              {glossary.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center justify-between rounded-lg p-2 text-xs hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex flex-col truncate pr-2">
                    <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                      {item.source}
                    </span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400">
                      {item.target}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteGlossary(item.id)}
                    className="rounded p-1 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="删除此术语"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 底部状态与快捷设置 */}
      <div className="border-t border-black/8 dark:border-white/8 p-3">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-medium">{currentConfig?.name || 'DeepSeek'}</span>
          </div>
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1 text-[11px] text-blue-500 hover:underline cursor-pointer"
          >
            切换配置
          </button>
        </div>
      </div>
    </aside>
  )
}
