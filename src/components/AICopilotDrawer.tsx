import React, { useState } from 'react'
import type { ChatMessage, PaperDocument, PaperSummary } from '../types'
import { APIService } from '../services/apiService'
import { 
  Sparkles, MessageSquare, BookOpen, Send, 
  Lightbulb, AlertTriangle, Cpu, BarChart3, 
  RefreshCw, X
} from 'lucide-react'

interface AICopilotDrawerProps {
  isOpen: boolean
  onClose: () => void
  document: PaperDocument
  onUpdateDocumentSummary: (summary: PaperSummary) => void
  onUpdateChatHistory: (messages: ChatMessage[]) => void
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  document,
  onUpdateDocumentSummary,
  onUpdateChatHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'chat'>('summary')
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [isChatting, setIsChatting] = useState(false)

  const summary = document.paperSummary
  const chatMessages = document.chatHistory || [
    {
      id: 'welcome',
      sender: 'ai',
      content: `你好！我是你的专属学术伴读 Copilot。我已经通读了《${document.title}》，你可以随时向我提问文章中的方法推导、实验对比或细节参数。`,
      timestamp: Date.now(),
    },
  ]

  const handleGenerateSummary = async () => {
    setIsSummarizing(true)
    try {
      const res = await APIService.summarizePaper(document)
      onUpdateDocumentSummary(res)
    } catch (err: any) {
      alert(`生成速读简报失败: ${err.message || '请检查 API 设置'}`)
    } finally {
      setIsSummarizing(false)
    }
  }

  const handleSendChat = async (questionText?: string) => {
    const textToSend = questionText || chatInput
    if (!textToSend.trim() || isChatting) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: textToSend.trim(),
      timestamp: Date.now(),
    }

    const newHistory = [...chatMessages, userMsg]
    onUpdateChatHistory(newHistory)
    setChatInput('')
    setIsChatting(true)

    try {
      const aiReply = await APIService.chatWithPaper({
        doc: document,
        messages: newHistory,
        question: textToSend.trim(),
      })

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: aiReply,
        timestamp: Date.now(),
      }

      onUpdateChatHistory([...newHistory, aiMsg])
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: `回答提问时出错: ${err.message || '网络连接中断'}`,
        timestamp: Date.now(),
      }
      onUpdateChatHistory([...newHistory, errorMsg])
    } finally {
      setIsChatting(false)
    }
  }

  if (!isOpen) return null

  return (
    <aside className="fixed right-0 top-12 bottom-0 z-40 flex w-96 flex-col border-l border-black/10 dark:border-white/10 bg-white/95 dark:bg-[#1c1c1f]/95 shadow-2xl backdrop-blur-2xl transition-all select-none">
      {/* 顶部 Header */}
      <div className="flex items-center justify-between border-b border-black/8 dark:border-white/8 p-3">
        <div className="flex items-center gap-2 font-semibold text-xs text-neutral-800 dark:text-neutral-200">
          <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span>PaperLens AI 伴读助手</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tab 切换 */}
      <div className="grid grid-cols-2 bg-black/5 dark:bg-white/5 p-1 mx-3 mt-2 rounded-xl text-xs">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            activeTab === 'summary'
              ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>四维速读简报</span>
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            activeTab === 'chat'
              ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>全文深度问答</span>
        </button>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'summary' ? (
          <div className="space-y-3">
            {/* 触发/重新生成按钮 */}
            <button
              onClick={handleGenerateSummary}
              disabled={isSummarizing}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white p-2.5 text-xs font-medium shadow-xs transition-all cursor-pointer disabled:bg-blue-400"
            >
              {isSummarizing ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>AI 正在研读论文并提取四维简报...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{summary ? '重新生成四维速读' : '一键生成四维速读简报'}</span>
                </>
              )}
            </button>

            {summary ? (
              <div className="space-y-2.5 animate-in fade-in">
                {/* 1. 核心创新点 */}
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-amber-600 dark:text-amber-400 mb-1.5">
                    <Lightbulb className="h-4 w-4" />
                    <span>🎯 核心创新与突破 (Contributions)</span>
                  </div>
                  <ul className="space-y-1 text-xs text-neutral-700 dark:text-neutral-300 list-disc pl-4 leading-relaxed">
                    {summary.contributions.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                {/* 2. 研究方法与技术路线 */}
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-blue-600 dark:text-blue-400 mb-1">
                    <Cpu className="h-4 w-4" />
                    <span>🔬 技术路线与模型架构 (Methodology)</span>
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {summary.methodology}
                  </p>
                </div>

                {/* 3. 实验基线与结论 */}
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-emerald-600 dark:text-emerald-400 mb-1">
                    <BarChart3 className="h-4 w-4" />
                    <span>📊 实验基线与关键指标 (Results)</span>
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {summary.results}
                  </p>
                </div>

                {/* 4. 局限与未来工作 */}
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-rose-600 dark:text-rose-400 mb-1">
                    <AlertTriangle className="h-4 w-4" />
                    <span>⚠️ 局限性与改进方向 (Limitations)</span>
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {summary.limitations}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-neutral-400">
                点击上方按钮，AI 将深度剖析这篇论文的创新点、技术方案、实验指标与局限性
              </div>
            )}
          </div>
        ) : (
          /* 问答对话 Tab */
          <div className="flex h-full flex-col justify-between">
            {/* 消息列表 */}
            <div className="space-y-3 pb-3">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-2.5 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-500 text-white rounded-br-xs'
                        : 'bg-black/5 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 rounded-bl-xs'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[9px] text-neutral-400 mt-0.5 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}

              {isChatting && (
                <div className="flex items-center gap-1 text-xs text-neutral-400 p-2">
                  <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
                  <span>AI 伴读正在查阅文献推演中...</span>
                </div>
              )}
            </div>

            {/* 常见预设学术问题 Chips */}
            <div className="space-y-2 border-t border-black/5 dark:border-white/5 pt-2">
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => handleSendChat('这篇论文的核心创新点是什么？')}
                  className="rounded-md bg-black/5 dark:bg-white/5 hover:bg-blue-500/10 hover:text-blue-500 px-2 py-0.5 text-[10px] text-neutral-500 transition-colors cursor-pointer"
                >
                  💡 核心创新点？
                </button>
                <button
                  onClick={() => handleSendChat('实验对比了哪些基准模型，提升了多少？')}
                  className="rounded-md bg-black/5 dark:bg-white/5 hover:bg-blue-500/10 hover:text-blue-500 px-2 py-0.5 text-[10px] text-neutral-500 transition-colors cursor-pointer"
                >
                  📊 实验提升了多少？
                </button>
                <button
                  onClick={() => handleSendChat('论文提出的核心算法或架构公式是什么？')}
                  className="rounded-md bg-black/5 dark:bg-white/5 hover:bg-blue-500/10 hover:text-blue-500 px-2 py-0.5 text-[10px] text-neutral-500 transition-colors cursor-pointer"
                >
                  📐 核心公式解析
                </button>
              </div>

              {/* 输入框 */}
              <div className="flex items-center gap-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-1.5">
                <input
                  type="text"
                  placeholder="针对论文自由提问..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  className="flex-1 bg-transparent px-2 text-xs outline-hidden text-neutral-800 dark:text-neutral-200"
                />
                <button
                  onClick={() => handleSendChat()}
                  disabled={!chatInput.trim() || isChatting}
                  className="rounded-lg bg-blue-500 p-1.5 text-white hover:bg-blue-600 disabled:opacity-40 cursor-pointer"
                >
                  <Send className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
