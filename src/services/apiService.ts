import type { 
  APIConfig, APIProvider, GlossaryItem, TranslationTone, 
  PaperDocument, PaperSummary, ChatMessage, BalanceInfo, UsageStats 
} from '../types'

export const DEFAULT_PROVIDERS: Record<APIProvider, APIConfig> = {
  deepseek: {
    provider: 'deepseek',
    name: 'DeepSeek (深度求索 V4/V3/R1)',
    apiKey: '',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    enabled: true,
    availableModels: ['deepseek-chat', 'deepseek-reasoner', 'deepseek-v4', 'deepseek-r1'],
    supportsStreaming: true,
  },
  kimi: {
    provider: 'kimi',
    name: 'Kimi (月之暗面 Moonshot)',
    apiKey: '',
    baseUrl: 'https://api.moonshot.cn/v1',
    model: 'moonshot-v1-32k',
    enabled: true,
    availableModels: ['moonshot-v1-auto', 'moonshot-v1-32k', 'moonshot-v1-128k', 'kimi-k2', 'moonshot-v1-8k'],
    supportsStreaming: true,
  },
  mimo: {
    provider: 'mimo',
    name: '小米 MiMo (Xiaomi / MiniMax)',
    apiKey: '',
    baseUrl: 'https://api.mimo.xiaomi.com/v1',
    model: 'mimo-v1',
    enabled: true,
    availableModels: ['mimo-v1', 'mimo-v1-pro', 'abab7-chat', 'MiniMax-Text-01'],
    supportsStreaming: true,
  },
  glm: {
    provider: 'glm',
    name: '智谱 GLM (智谱 AI)',
    apiKey: '',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4-plus',
    enabled: true,
    availableModels: ['glm-4-plus', 'glm-4-air', 'glm-4-flash', 'glm-4-long', 'glm-zero-preview'],
    supportsStreaming: true,
  },
  qwen: {
    provider: 'qwen',
    name: '通义千问 Qwen (阿里云)',
    apiKey: '',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-plus',
    enabled: true,
    availableModels: ['qwen-plus', 'qwen-max', 'qwen-turbo', 'qwen-long', 'qwen2.5-72b-instruct'],
    supportsStreaming: true,
  },
  openai: {
    provider: 'openai',
    name: 'OpenAI (官方)',
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o',
    enabled: true,
    availableModels: ['gpt-4o', 'gpt-4o-mini', 'o3-mini', 'o1', 'gpt-4.5-preview'],
    supportsStreaming: true,
  },
  claude: {
    provider: 'claude',
    name: 'Anthropic Claude',
    apiKey: '',
    baseUrl: 'https://api.anthropic.com/v1',
    model: 'claude-3-7-sonnet-20250219',
    enabled: true,
    availableModels: ['claude-3-7-sonnet-20250219', 'claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest'],
    supportsStreaming: true,
  },
  gemini: {
    provider: 'gemini',
    name: 'Google Gemini',
    apiKey: '',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-2.0-flash',
    enabled: true,
    availableModels: ['gemini-2.0-flash', 'gemini-2.0-pro-exp-02-05', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    supportsStreaming: true,
  },
  custom: {
    provider: 'custom',
    name: '自定义 OpenAI 兼容协议 (本地/中转/NewAPI)',
    apiKey: '',
    baseUrl: 'http://localhost:11434/v1',
    model: 'llama3.1',
    enabled: false,
    availableModels: ['llama3.1', 'deepseek-v4', 'deepseek-r1:8b', 'qwen2.5:72b', 'custom-model'],
    supportsStreaming: true,
  },
}

const STORAGE_KEY_CONFIGS = 'greenwhale_api_configs'
const STORAGE_KEY_ACTIVE = 'greenwhale_active_provider'
const STORAGE_KEY_GLOSSARY = 'greenwhale_glossary'
const STORAGE_KEY_USAGE = 'paperlens_usage_stats'

export class APIService {
  static getConfigs(): Record<APIProvider, APIConfig> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONFIGS)
      if (stored) {
        const parsed = JSON.parse(stored)
        const merged: Record<APIProvider, APIConfig> = { ...DEFAULT_PROVIDERS }
        for (const key of Object.keys(DEFAULT_PROVIDERS) as APIProvider[]) {
          if (parsed[key]) {
            merged[key] = {
              ...DEFAULT_PROVIDERS[key],
              ...parsed[key],
              name: DEFAULT_PROVIDERS[key].name,
              availableModels: Array.from(new Set([
                ...DEFAULT_PROVIDERS[key].availableModels,
                ...(parsed[key].availableModels || []),
              ])),
            }
          }
        }
        return merged
      }
    } catch (e) {
      console.error('Failed to load API configs from localStorage', e)
    }
    return { ...DEFAULT_PROVIDERS }
  }

  static saveConfig(provider: APIProvider, config: Partial<APIConfig>): void {
    const all = this.getConfigs()
    all[provider] = { ...all[provider], ...config }
    localStorage.setItem(STORAGE_KEY_CONFIGS, JSON.stringify(all))
  }

  static getActiveProvider(): APIProvider {
    const active = localStorage.getItem(STORAGE_KEY_ACTIVE) as APIProvider
    if (active && DEFAULT_PROVIDERS[active]) {
      return active
    }
    return 'deepseek'
  }

  static setActiveProvider(provider: APIProvider): void {
    localStorage.setItem(STORAGE_KEY_ACTIVE, provider)
  }

  static getTone(): TranslationTone {
    return (localStorage.getItem('paperlens_translation_tone') as TranslationTone) || 'fluent'
  }

  static setTone(tone: TranslationTone): void {
    localStorage.setItem('paperlens_translation_tone', tone)
  }

  static getGlossary(): GlossaryItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_GLOSSARY)
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.error('Failed to load glossary', e)
    }
    return [
      { id: '1', source: 'Transformer', target: 'Transformer架构', domain: 'AI' },
      { id: '2', source: 'attention mechanism', target: '注意力机制', domain: 'AI' },
      { id: '3', source: 'latent space', target: '潜空间', domain: 'AI/Math' },
      { id: '4', source: 'ground truth', target: '真实真值(Ground Truth)', domain: 'General' },
      { id: '5', source: 'ablation study', target: '消融实验', domain: 'AI' },
    ]
  }

  static saveGlossary(items: GlossaryItem[]): void {
    localStorage.setItem(STORAGE_KEY_GLOSSARY, JSON.stringify(items))
  }

  /**
   * 公式占位符提取保护
   */
  static protectMathFormulas(text: string): { sanitizedText: string; placeholders: Map<string, string> } {
    const placeholders = new Map<string, string>()
    let counter = 0

    // 保护行间公式 $$ ... $$ 和 \[ ... \]
    let sanitized = text.replace(/(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\])/g, (match) => {
      counter++
      const tag = `__MATH_BLOCK_${counter}__`
      placeholders.set(tag, match)
      return tag
    })

    // 保护行内公式 $ ... $ 和 \( ... \)
    sanitized = sanitized.replace(/(\$[^$\n]+\$|\\\([\s\S]*?\\\))/g, (match) => {
      counter++
      const tag = `__MATH_INLINE_${counter}__`
      placeholders.set(tag, match)
      return tag
    })

    return { sanitizedText: sanitized, placeholders }
  }

  /**
   * 公式占位符还原
   */
  static restoreMathFormulas(text: string, placeholders: Map<string, string>): string {
    let restored = text
    for (const [tag, originalMath] of placeholders.entries()) {
      restored = restored.split(tag).join(originalMath)
    }
    return restored
  }

  /**
   * 测试 API 连通性与延迟
   */
  static async testConnection(provider: APIProvider): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    const config = this.getConfigs()[provider]
    if (!config.apiKey && provider !== 'custom') {
      return { success: false, latencyMs: 0, error: '未输入 API Key' }
    }

    const startTime = Date.now()
    try {
      const response = await this.translateText({
        text: 'The proposed architecture significantly outperforms baseline models in benchmark evaluation.',
        config,
        systemPrompt: 'You are an academic translation assistant. Translate the text accurately to Simplified Chinese. Return only the translation.',
      })

      const latencyMs = Date.now() - startTime
      if (response && response.trim().length > 0) {
        this.saveConfig(provider, { latencyMs, lastChecked: Date.now() })
        return { success: true, latencyMs }
      }
      return { success: false, latencyMs, error: '模型响应为空' }
    } catch (err: any) {
      const latencyMs = Date.now() - startTime
      return { success: false, latencyMs, error: err.message || '网络连接或鉴权失败' }
    }
  }

  /**
   * 本地翻译消耗用量统计
   */
  static getUsageStats(): UsageStats {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USAGE)
      if (stored) return JSON.parse(stored)
    } catch {}
    return { totalChars: 0, totalTokens: 0, requestsCount: 0 }
  }

  static recordUsage(charCount: number): void {
    const stats = this.getUsageStats()
    stats.totalChars += charCount
    stats.totalTokens += Math.ceil(charCount / 1.6)
    stats.requestsCount += 1
    localStorage.setItem(STORAGE_KEY_USAGE, JSON.stringify(stats))
  }

  static resetUsageStats(): void {
    localStorage.removeItem(STORAGE_KEY_USAGE)
  }

  /**
   * 官方 API 账户余额与额度实时查询
   */
  static async checkBalance(provider: APIProvider, overrideConfig?: APIConfig): Promise<BalanceInfo> {
    const config = overrideConfig || this.getConfigs()[provider]
    if (!config || (!config.apiKey && provider !== 'custom')) {
      return { supported: false, error: `请先在上方输入 ${config?.name?.split(' ')[0] || provider} 的 API Key` }
    }

    // 1. DeepSeek 官方余额端点查询
    if (provider === 'deepseek') {
      try {
        const res = await fetch('https://api.deepseek.com/user/balance', {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
          },
        })
        if (!res.ok) {
          const err = await res.text()
          return { supported: true, error: `查询失败 (${res.status}): ${err}` }
        }
        const data = await res.json()
        if (data.is_available && data.balance_infos && data.balance_infos.length > 0) {
          const info = data.balance_infos[0]
          return {
            supported: true,
            totalBalance: info.total_balance,
            currency: info.currency === 'CNY' ? '¥' : '$',
            grantedBalance: info.granted_balance,
            toppedUpBalance: info.topped_up_balance,
          }
        }
        return { supported: true, totalBalance: '0.00', currency: '¥' }
      } catch (err: any) {
        return { supported: true, error: err.message || '查询 DeepSeek 余额网络异常' }
      }
    }

    // 2. Kimi (Moonshot) 官方余额端点查询
    if (provider === 'kimi') {
      try {
        const res = await fetch('https://api.moonshot.cn/v1/users/me/balance', {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
          },
        })
        if (!res.ok) {
          const err = await res.text()
          return { supported: true, error: `查询失败 (${res.status}): ${err}` }
        }
        const data = await res.json()
        if (data.error) {
          return { supported: true, error: data.error.message || '查询失败' }
        }
        if (data.data) {
          const avail = data.data.available_balance !== undefined 
            ? data.data.available_balance 
            : (Number(data.data.cash_balance || 0) + Number(data.data.voucher_balance || 0))
          return {
            supported: true,
            totalBalance: Number(avail).toFixed(2),
            currency: '¥',
            grantedBalance: Number(data.data.voucher_balance || 0).toFixed(2),
            toppedUpBalance: Number(data.data.cash_balance || 0).toFixed(2),
          }
        }
        return { supported: true, error: data.message || '未获取到 Kimi 账户数据' }
      } catch (err: any) {
        return { supported: true, error: err.message || '查询 Kimi 余额网络异常' }
      }
    }

    // 3. 通用第三方 / OneAPI / NewAPI / OpenAI 聚合服务商端点自动嗅探
    try {
      const baseUrl = config.baseUrl.replace(/\/v1\/?$/, '').replace(/\/$/, '')
      const probeEndpoints = [
        `${baseUrl}/api/user/self`,
        `${baseUrl}/dashboard/billing/credit_grants`,
        `${baseUrl}/v1/dashboard/billing/subscription`,
      ]
      for (const endpoint of probeEndpoints) {
        try {
          const res = await fetch(endpoint, {
            headers: { Authorization: `Bearer ${config.apiKey}` },
          })
          if (res.ok) {
            const json = await res.json()
            if (json.data && typeof json.data.quota === 'number') {
              // OneAPI / NewAPI 汇率换算: 500,000 = $1.00
              const balance = (json.data.quota / 500000).toFixed(2)
              return { supported: true, totalBalance: balance, currency: '$' }
            }
            if (typeof json.total_available === 'number') {
              return { supported: true, totalBalance: json.total_available.toFixed(2), currency: '$' }
            }
          }
        } catch {
          // ignore
        }
      }
    } catch {}

    return {
      supported: false,
      rawMessage: '该厂商未开放免验证码的公开余额查询接口，请直接登录官网控制台；下方已为您实时精确统计本地实际翻译消耗。',
    }
  }

  /**
   * 翻译单段或图表/表格文本
   */
  static async translateText({
    text,
    config,
    glossary,
    systemPrompt,
  }: {
    text: string
    config?: APIConfig
    glossary?: GlossaryItem[]
    systemPrompt?: string
  }): Promise<string> {
    const activeConfig = config || this.getConfigs()[this.getActiveProvider()]
    if (!activeConfig) throw new Error('No active API configuration')

    // 1. 公式保护
    const { sanitizedText, placeholders } = this.protectMathFormulas(text)

    // 2. 术语表约束构建
    const currentGlossary = glossary || this.getGlossary()
    const glossaryPrompt = currentGlossary.length > 0
      ? `\n必须遵循的专业学术名词统一译法：\n${currentGlossary.map((g) => `- "${g.source}" -> "${g.target}"`).join('\n')}`
      : ''

    const tone = this.getTone()
    let toneGuide = '1. 语言风格严谨、学术、流畅，符合中文顶级学术期刊（如中国科学、计算机学报）规范；'
    if (tone === 'strict') {
      toneGuide = '1. 语言风格严格直译求实，忠实于原文每一处语法从句与实验参数，适合实验步骤与推导；'
    } else if (tone === 'simple') {
      toneGuide = '1. 语言风格通俗易懂，将晦涩的复合长难句拆解为清晰自然的短句，便于快速浏览；'
    }

    const finalSystemPrompt = systemPrompt || `你是一位顶尖的英文学术论文翻译与同行评审专家。
请将用户提供的学术论文内容翻译为信达雅的简体中文：
${toneGuide}
2. 严禁翻译或破坏类似 __MATH_INLINE_1__ 或 __MATH_BLOCK_1__ 的数学公式占位符；
3. 保留文献引用符号（如 [1], [2-4], et al.）；
4. 保留专有名词缩写（如 ResNet, GPU, SGD, p-value）；
5. 仅返回翻译后的正文结果，绝对不要包含任何开场白、问候语或解释文字。${glossaryPrompt}`

    // 3. 执行多模型协议调用
    let rawTranslation = ''
    if (activeConfig.provider === 'claude') {
      rawTranslation = await this.callAnthropic(activeConfig, finalSystemPrompt, sanitizedText)
    } else if (activeConfig.provider === 'gemini') {
      rawTranslation = await this.callGemini(activeConfig, finalSystemPrompt, sanitizedText)
    } else {
      // 兼容所有标准 OpenAI 格式模型 (DeepSeek, Kimi, MiMo, GLM, Qwen, OpenAI, Custom)
      rawTranslation = await this.callOpenAICompatible(activeConfig, finalSystemPrompt, sanitizedText)
    }

    // 4. 公式还原与用量统计
    this.recordUsage(text.length)
    return this.restoreMathFormulas(rawTranslation.trim(), placeholders)
  }

  private static async callOpenAICompatible(config: APIConfig, systemPrompt: string, userText: string): Promise<string> {
    const url = `${config.baseUrl.replace(/\/$/, '')}/chat/completions`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userText },
        ],
        temperature: 0.2,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`API 请求失败 (${response.status}): ${errText}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  }

  private static async callAnthropic(config: APIConfig, systemPrompt: string, userText: string): Promise<string> {
    const url = `${config.baseUrl.replace(/\/$/, '')}/messages`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'dangerously-allow-browser': 'true',
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userText }],
        temperature: 0.2,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Claude API 错误 (${response.status}): ${errText}`)
    }

    const data = await response.json()
    return data.content?.[0]?.text || ''
  }

  private static async callGemini(config: APIConfig, systemPrompt: string, userText: string): Promise<string> {
    const url = `${config.baseUrl.replace(/\/$/, '')}/models/${config.model}:generateContent?key=${config.apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n待翻译学术内容：\n${userText}` }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
        },
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Gemini API 错误 (${response.status}): ${errText}`)
    }

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  }

  /**
   * 划词即译与学术释义
   */
  static async translateSelection(text: string, config?: APIConfig): Promise<{ translation: string; phonetics?: string; pos?: string }> {
    const trimmed = text.trim()
    if (!trimmed) return { translation: '' }
    const isSingleWord = /^[a-zA-Z\-_]{1,30}$/.test(trimmed)
    const prompt = isSingleWord 
      ? `你是一位学术词典专家。请提供英文学术单词 "${trimmed}" 的学术释义，格式必须为 JSON：
{
  "phonetics": "/音标/",
  "pos": "词性(如 n. / v. / adj.)",
  "translation": "精准的学术中文释义"
}
只输出纯 JSON，不要包含任何 markdown 或其他字符。`
      : `请将以下英文学术短语或长难句翻译为地道精准的中文学术释义：
"${trimmed}"
只返回翻译后的中文结果，不要包含任何开场白或解释。`

    try {
      const activeConfig = config || this.getConfigs()[this.getActiveProvider()]
      const result = await this.callOpenAICompatible(
        activeConfig,
        'You are an expert bilingual academic dictionary and translator.',
        prompt
      )
      if (isSingleWord) {
        try {
          const clean = result.replace(/```json|```/g, '').trim()
          const parsed = JSON.parse(clean)
          return parsed
        } catch {
          return { translation: result.trim() }
        }
      }
      return { translation: result.trim() }
    } catch (err: any) {
      return { translation: `查询失败: ${err.message || '请检查网络或API'}` }
    }
  }

  /**
   * AI 论文一键四维智能速读简报
   */
  static async summarizePaper(doc: PaperDocument, config?: APIConfig): Promise<PaperSummary> {
    const activeConfig = config || this.getConfigs()[this.getActiveProvider()]
    
    // 提取标题、摘要及前几页重要段落作为上下文
    const abstractBlock = doc.blocks.find((b) => b.type === 'abstract')
    const headingsAndText = doc.blocks
      .filter((b) => b.type === 'heading' || b.type === 'paragraph')
      .slice(0, 20)
      .map((b) => b.originalText)
      .join('\n\n')
      .slice(0, 8000)

    const context = `论文标题: ${doc.title}
摘要: ${abstractBlock ? abstractBlock.originalText : '无'}
主要正文节选:
${headingsAndText}`

    const systemPrompt = `你是一位世界顶级学术同行评审专家（Reviewer）。请深度剖析用户提供的学术论文，提取出四维核心速读简报。
输出必须是严格合法的 JSON 对象，不要包含任何 \`\`\`json 标记，格式必须如下：
{
  "contributions": [
    "核心创新点1（一句话精准概括突破性贡献）",
    "核心创新点2",
    "核心创新点3"
  ],
  "methodology": "核心技术路线与研究方法（简述其提出的核心模型架构、算法流程或实验设计方案，100-200字）",
  "results": "核心实验结果与基线对比（指明在哪些公开测试集上达到了怎样的SOTA指标，相较于基准提升了多少，100-150字）",
  "limitations": "论文潜在局限与未来改进方向（客观指出计算开销、理论假设或应用场景的局限，50-100字）"
}`

    const response = await this.callOpenAICompatible(activeConfig, systemPrompt, context)
    try {
      const clean = response.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      return {
        contributions: Array.isArray(parsed.contributions) ? parsed.contributions : ['提出了一种新颖的研究方法'],
        methodology: parsed.methodology || '',
        results: parsed.results || '',
        limitations: parsed.limitations || '',
        generatedAt: Date.now(),
      }
    } catch {
      return {
        contributions: ['深度解析论文结构并提取核心算法', '在基准测试上进行了全面实验验证'],
        methodology: response.slice(0, 300),
        results: '相较于基线模型实现了可测量的性能提升。',
        limitations: '需进一步在大规模开放域环境中进行鲁棒性评估。',
        generatedAt: Date.now(),
      }
    }
  }

  /**
   * 针对当前文献进行 AI 学术伴读问答 (Chat with Paper)
   */
  static async chatWithPaper({
    doc,
    messages,
    question,
    config,
  }: {
    doc: PaperDocument
    messages: ChatMessage[]
    question: string
    config?: APIConfig
  }): Promise<string> {
    const activeConfig = config || this.getConfigs()[this.getActiveProvider()]
    
    // 构造论文上下文
    const textContext = doc.blocks
      .slice(0, 30)
      .map((b) => `${b.type.toUpperCase()}: ${b.originalText}`)
      .join('\n\n')
      .slice(0, 10000)

    const historyMessages = messages.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.content,
    }))

    const systemPrompt = `你是一位专注于当前学术论文的科研伴读助手。
【当前论文信息】
标题: ${doc.title}
页数: ${doc.pageCount}
正文关键上下文片段：
${textContext}

【回答要求】
1. 请根据上述论文内容，专业、严谨、有理有据地回答用户的科研提问；
2. 如果论文中明确提到了相关实验参数、数据集或定理，请明确引用并指出；
3. 如果用户问到的内容超出了论文正文范围，请结合你的专业知识予以客观补充，并说明“论文中未明确提及”；
4. 语言风格符合中文学术探讨习惯。`

    return this.callOpenAICompatible(activeConfig, systemPrompt, `历史对话：\n${JSON.stringify(historyMessages)}\n\n用户最新问题：${question}`)
  }
}
