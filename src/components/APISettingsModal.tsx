import React, { useState, useEffect } from 'react'
import type { APIConfig, APIProvider, TranslationTone, BalanceInfo, UsageStats } from '../types'
import { APIService, DEFAULT_PROVIDERS } from '../services/apiService'
import { 
  X, Check, Eye, EyeOff, Activity, Server, Key, Cpu, ShieldCheck, 
  RotateCcw, AlertCircle, Sparkles, Feather, Wallet, RefreshCw, Trash2
} from 'lucide-react'

interface APISettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onProviderChanged?: (provider: APIProvider) => void
  onToneChanged?: (tone: TranslationTone) => void
}

export const APISettingsModal: React.FC<APISettingsModalProps> = ({
  isOpen,
  onClose,
  onProviderChanged,
  onToneChanged,
}) => {
  const [configs, setConfigs] = useState<Record<APIProvider, APIConfig>>(() => APIService.getConfigs())
  const [activeProvider, setActiveProvider] = useState<APIProvider>(() => APIService.getActiveProvider())
  const [selectedProvider, setSelectedProvider] = useState<APIProvider>(activeProvider)
  const [currentTone, setCurrentTone] = useState<TranslationTone>(() => APIService.getTone())
  
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; latencyMs?: number; error?: string } | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [checkingBalance, setCheckingBalance] = useState(false)
  const [balanceResult, setBalanceResult] = useState<BalanceInfo | null>(null)
  const [usageStats, setUsageStats] = useState<UsageStats>(() => APIService.getUsageStats())

  useEffect(() => {
    if (isOpen) {
      const stored = APIService.getConfigs()
      setConfigs(stored)
      const active = APIService.getActiveProvider()
      setActiveProvider(active)
      setSelectedProvider(active)
      setTestResult(null)
      setSaveSuccess(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const currentConfig = configs[selectedProvider]

  const handleUpdateConfig = (updates: Partial<APIConfig>) => {
    const updated = { ...currentConfig, ...updates }
    const all = { ...configs, [selectedProvider]: updated }
    setConfigs(all)
    APIService.saveConfig(selectedProvider, updates)
  }

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)
    const res = await APIService.testConnection(selectedProvider)
    setTesting(false)
    setTestResult(res)
  }

  const handleCheckBalance = async () => {
    setCheckingBalance(true)
    setBalanceResult(null)
    const res = await APIService.checkBalance(selectedProvider)
    setCheckingBalance(false)
    setBalanceResult(res)
  }

  const handleResetUsage = () => {
    if (confirm('确定要重置本地累计消耗统计吗？')) {
      APIService.resetUsageStats()
      setUsageStats({ totalChars: 0, totalTokens: 0, requestsCount: 0 })
    }
  }

  const handleSetAsActive = () => {
    APIService.setActiveProvider(selectedProvider)
    setActiveProvider(selectedProvider)
    onProviderChanged?.(selectedProvider)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  const handleResetDefaults = () => {
    const defaultVal = DEFAULT_PROVIDERS[selectedProvider]
    handleUpdateConfig({
      baseUrl: defaultVal.baseUrl,
      model: defaultVal.model,
    })
  }

  const providerList: Array<{ id: APIProvider; label: string; badge?: string; desc: string }> = [
    { id: 'deepseek', label: 'DeepSeek', badge: '首选高性价比', desc: '深度求索 (DeepSeek-V3 / R1)' },
    { id: 'kimi', label: 'Kimi', badge: '长文本强', desc: '月之暗面 Moonshot API' },
    { id: 'mimo', label: '小米 MiMo', badge: '敏捷推理', desc: 'Xiaomi MiMo 端云一体' },
    { id: 'glm', label: '智谱 GLM', badge: '学术底蕴', desc: '智谱 AI GLM-4 Plus' },
    { id: 'qwen', label: '通义千问 Qwen', badge: '多语言优', desc: '阿里云通义千问 Max/Plus' },
    { id: 'openai', label: 'OpenAI', desc: 'GPT-4o / GPT-4o-mini' },
    { id: 'claude', label: 'Claude', desc: 'Anthropic Claude 3.5 Sonnet' },
    { id: 'gemini', label: 'Gemini', desc: 'Google Gemini 1.5 / 2.0' },
    { id: 'custom', label: '自定义端点', desc: 'Ollama / SiliconFlow / 本地模型' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative flex h-[620px] w-full max-w-3xl overflow-hidden rounded-2xl bg-white dark:bg-[#1e1e20] shadow-2xl border border-black/10 dark:border-white/10">
        {/* 左侧服务商侧边栏 */}
        <div className="w-64 border-r border-black/5 dark:border-white/5 bg-neutral-50/70 dark:bg-neutral-900/50 p-4 flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center gap-2 px-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">API 服务商设置</h2>
            </div>

            <div className="space-y-1">
              {providerList.map((item) => {
                const isSelected = selectedProvider === item.id
                const isCurrentActive = activeProvider === item.id
                const hasKey = !!configs[item.id]?.apiKey

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedProvider(item.id)
                      setTestResult(null)
                    }}
                    className={`group relative flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-blue-500 text-white font-medium shadow-xs'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`rounded-sm px-1 py-0.2 text-[9px] font-medium ${
                              isSelected
                                ? 'bg-white/25 text-white'
                                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-[10px] truncate max-w-[150px] ${
                          isSelected ? 'text-white/80' : 'text-neutral-400'
                        }`}
                      >
                        {item.desc}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {isCurrentActive && (
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-emerald-500 ring-2 ring-emerald-500/20'
                          }`}
                          title="当前使用的翻译引擎"
                        />
                      )}
                      {hasKey && !isCurrentActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-xl bg-black/5 dark:bg-white/5 p-3 text-[11px] text-neutral-500 dark:text-neutral-400 flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong>本地安全加密</strong>：所有 API Key 仅保存在您的 Mac 本地浏览器安全存储中，绝不经由第三方服务器。
            </div>
          </div>
        </div>

        {/* 右侧配置详情面板 */}
        <div className="flex-1 flex flex-col justify-between p-6 overflow-y-auto">
          <div>
            {/* 顶栏信息 */}
            <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    {currentConfig.name}
                  </h3>
                  {activeProvider === selectedProvider ? (
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      当前主翻译引擎
                    </span>
                  ) : (
                    <button
                      onClick={handleSetAsActive}
                      className="rounded-full bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400 transition-colors"
                    >
                      设为当前引擎
                    </button>
                  )}
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  输入您的专属 API Key，畅享极速、高准确度的学术论文全文与图表翻译。
                </p>
              </div>

              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 表单字段 */}
            <div className="mt-5 space-y-4">
              {/* API Key */}
              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  <span className="flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-blue-500" />
                    <span>API Key (密钥)</span>
                  </span>
                  <span className="text-[11px] text-neutral-400">BYOK 自带密钥</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={currentConfig.apiKey}
                    onChange={(e) => handleUpdateConfig({ apiKey: e.target.value.trim() })}
                    placeholder={`请输入 ${currentConfig.name} API Key (例如 sk-...)`}
                    className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-neutral-50/50 dark:bg-neutral-900/60 px-3.5 py-2 text-xs font-mono text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2.5 p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                  >
                    {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* API Base URL */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  <span className="flex items-center gap-1.5">
                    <Server className="h-3.5 w-3.5 text-blue-500" />
                    <span>API 接口地址 (Base URL)</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-blue-500"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>恢复官方默认</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={currentConfig.baseUrl}
                  onChange={(e) => handleUpdateConfig({ baseUrl: e.target.value.trim() })}
                  className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-neutral-50/50 dark:bg-neutral-900/60 px-3.5 py-2 text-xs font-mono text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* 模型选择 */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  <Cpu className="h-3.5 w-3.5 text-blue-500" />
                  <span>选用模型 (Model)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {currentConfig.availableModels.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleUpdateConfig({ model: m })}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs transition-all ${
                        currentConfig.model === m
                          ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium'
                          : 'border-black/5 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-600 dark:text-neutral-300 hover:border-black/15'
                      }`}
                    >
                      <span className="font-mono text-[11px] truncate">{m}</span>
                      {currentConfig.model === m && <Check className="h-3.5 w-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>
                {/* 自定义模型名称输入 */}
                <div className="mt-2">
                  <input
                    type="text"
                    value={currentConfig.model}
                    onChange={(e) => handleUpdateConfig({ model: e.target.value.trim() })}
                    placeholder="或直接在此手动输入自定义模型名称"
                    className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-3 py-1.5 text-xs font-mono text-neutral-700 dark:text-neutral-300 placeholder-neutral-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 学术翻译语气风格预设 */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  <Feather className="h-3.5 w-3.5 text-blue-500" />
                  <span>学术翻译语气风格 (Tone)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentTone('fluent')
                      APIService.setTone('fluent')
                      onToneChanged?.('fluent')
                    }}
                    className={`flex flex-col p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      currentTone === 'fluent'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium'
                        : 'border-black/5 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-600 dark:text-neutral-300 hover:border-black/15'
                    }`}
                  >
                    <span className="font-semibold text-[11px]">地道学术中文</span>
                    <span className="text-[9px] text-neutral-400 mt-0.5">符合国家顶级学报规范</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentTone('strict')
                      APIService.setTone('strict')
                      onToneChanged?.('strict')
                    }}
                    className={`flex flex-col p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      currentTone === 'strict'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium'
                        : 'border-black/5 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-600 dark:text-neutral-300 hover:border-black/15'
                    }`}
                  >
                    <span className="font-semibold text-[11px]">严谨直译求实</span>
                    <span className="text-[9px] text-neutral-400 mt-0.5">适合实验步骤与定理推导</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentTone('simple')
                      APIService.setTone('simple')
                      onToneChanged?.('simple')
                    }}
                    className={`flex flex-col p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      currentTone === 'simple'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium'
                        : 'border-black/5 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-600 dark:text-neutral-300 hover:border-black/15'
                    }`}
                  >
                    <span className="font-semibold text-[11px]">通俗易懂通读</span>
                    <span className="text-[9px] text-neutral-400 mt-0.5">化简长难句快速泛读</span>
                  </button>
                </div>
              </div>

              {/* API 额度与余额查询 + 本地使用消耗统计 */}
              <div className="rounded-2xl border border-black/8 dark:border-white/10 bg-neutral-50/60 dark:bg-neutral-900/50 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    <Wallet className="h-4 w-4 text-emerald-500" />
                    <span>API 账户额度与使用统计</span>
                  </div>
                  <button
                    type="button"
                    disabled={checkingBalance}
                    onClick={handleCheckBalance}
                    className="flex items-center gap-1 rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-800 px-2.5 py-1 text-[11px] font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all cursor-pointer disabled:opacity-50"
                    title="向官方接口实时查询账户当前剩余额度与充值金额"
                  >
                    <RefreshCw className={`h-3 w-3 text-blue-500 ${checkingBalance ? 'animate-spin' : ''}`} />
                    <span>{checkingBalance ? '查询中...' : '实时查询余额'}</span>
                  </button>
                </div>

                {/* 余额查询结果展示 */}
                {balanceResult && (
                  <div className="rounded-xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-neutral-800/80 p-3 text-xs animate-in fade-in">
                    {balanceResult.error ? (
                      <div className="flex items-center gap-1.5 text-rose-500">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{balanceResult.error}</span>
                      </div>
                    ) : balanceResult.supported && balanceResult.totalBalance !== undefined ? (
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-neutral-500 text-[11px]">当前账户总余额:</span>
                          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                            {balanceResult.currency} {balanceResult.totalBalance}
                          </span>
                        </div>
                        {(balanceResult.grantedBalance || balanceResult.toppedUpBalance) && (
                          <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                            {balanceResult.toppedUpBalance && (
                              <span>充值余额: {balanceResult.currency}{balanceResult.toppedUpBalance}</span>
                            )}
                            {balanceResult.grantedBalance && (
                              <span>赠送额度: {balanceResult.currency}{balanceResult.grantedBalance}</span>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-neutral-500 text-[11px] leading-relaxed">
                        {balanceResult.rawMessage}
                      </div>
                    )}
                  </div>
                )}

                {/* 本地累计用量统计卡片 */}
                <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-black/5 dark:border-white/5">
                  <div className="rounded-xl bg-black/3 dark:bg-white/5 p-2">
                    <div className="text-[10px] text-neutral-400">累计翻译字符</div>
                    <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mt-0.5 font-mono">
                      {usageStats.totalChars.toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-xl bg-black/3 dark:bg-white/5 p-2">
                    <div className="text-[10px] text-neutral-400">预估消耗 Token</div>
                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5 font-mono">
                      ~{usageStats.totalTokens.toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-xl bg-black/3 dark:bg-white/5 p-2 relative group">
                    <div className="text-[10px] text-neutral-400">翻译调用次数</div>
                    <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mt-0.5 font-mono">
                      {usageStats.requestsCount} 次
                    </div>
                    {usageStats.requestsCount > 0 && (
                      <button
                        type="button"
                        onClick={handleResetUsage}
                        className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-500 p-0.5 transition-opacity"
                        title="清空统计"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 连通性测试结果面板 */}
              {testResult && (
                <div
                  className={`flex items-center justify-between rounded-xl p-3 text-xs ${
                    testResult.success
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span>
                      {testResult.success
                        ? `API 接口连通正常！学术测试翻译完成`
                        : `连接失败：${testResult.error}`}
                    </span>
                  </div>
                  {testResult.latencyMs !== undefined && (
                    <span className="font-mono text-[11px] font-semibold">
                      {testResult.latencyMs} ms
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 底部按钮栏 */}
          <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              disabled={testing}
              onClick={handleTestConnection}
              className="flex items-center gap-1.5 rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-800 px-3.5 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-200 shadow-xs hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 transition-all"
            >
              <Activity className={`h-3.5 w-3.5 text-blue-500 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? '正在测试连接...' : '测试接口连通性'}</span>
            </button>

            <div className="flex items-center gap-2">
              {saveSuccess && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <Check className="h-3.5 w-3.5" /> 已生效
                </span>
              )}
              <button
                type="button"
                onClick={handleSetAsActive}
                className="rounded-xl bg-blue-500 hover:bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition-all"
              >
                保存并设为当前模型
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
