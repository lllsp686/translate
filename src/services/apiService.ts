import type { APIConfig, APIProvider, GlossaryItem } from '../types'

export const DEFAULT_PROVIDERS: Record<APIProvider, APIConfig> = {
  deepseek: {
    provider: 'deepseek',
    name: 'DeepSeek (深度求索)',
    apiKey: '',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    enabled: true,
    availableModels: ['deepseek-chat', 'deepseek-reasoner'],
    supportsStreaming: true,
  },
  kimi: {
    provider: 'kimi',
    name: 'Kimi (月之暗面 Moonshot)',
    apiKey: '',
    baseUrl: 'https://api.moonshot.cn/v1',
    model: 'moonshot-v1-32k',
    enabled: true,
    availableModels: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k', 'kimi-k2'],
    supportsStreaming: true,
  },
  mimo: {
    provider: 'mimo',
    name: '小米 MiMo (Xiaomi)',
    apiKey: '',
    baseUrl: 'https://api.mimo.xiaomi.com/v1',
    model: 'mimo-v1',
    enabled: true,
    availableModels: ['mimo-v1', 'mimo-v1-lite'],
    supportsStreaming: true,
  },
  glm: {
    provider: 'glm',
    name: '智谱 GLM (智谱 AI)',
    apiKey: '',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4-plus',
    enabled: true,
    availableModels: ['glm-4-plus', 'glm-4-flash', 'glm-4-long'],
    supportsStreaming: true,
  },
  qwen: {
    provider: 'qwen',
    name: '通义千问 Qwen (阿里云)',
    apiKey: '',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-plus',
    enabled: true,
    availableModels: ['qwen-plus', 'qwen-max', 'qwen-turbo'],
    supportsStreaming: true,
  },
  openai: {
    provider: 'openai',
    name: 'OpenAI (官方)',
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o',
    enabled: true,
    availableModels: ['gpt-4o', 'gpt-4o-mini', 'o3-mini'],
    supportsStreaming: true,
  },
  claude: {
    provider: 'claude',
    name: 'Anthropic Claude',
    apiKey: '',
    baseUrl: 'https://api.anthropic.com/v1',
    model: 'claude-3-5-sonnet-20241022',
    enabled: true,
    availableModels: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
    supportsStreaming: true,
  },
  gemini: {
    provider: 'gemini',
    name: 'Google Gemini',
    apiKey: '',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-1.5-pro',
    enabled: true,
    availableModels: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash'],
    supportsStreaming: true,
  },
  custom: {
    provider: 'custom',
    name: '自定义 OpenAI 兼容协议 (本地/中转)',
    apiKey: '',
    baseUrl: 'http://localhost:11434/v1',
    model: 'llama3.1',
    enabled: false,
    availableModels: ['llama3.1', 'deepseek-r1:8b', 'qwen2.5:7b', 'custom-model'],
    supportsStreaming: true,
  },
}

const STORAGE_KEY_CONFIGS = 'greenwhale_api_configs'
const STORAGE_KEY_ACTIVE = 'greenwhale_active_provider'
const STORAGE_KEY_GLOSSARY = 'greenwhale_glossary'

export class APIService {
  static getConfigs(): Record<APIProvider, APIConfig> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONFIGS)
      if (stored) {
        const parsed = JSON.parse(stored)
        return { ...DEFAULT_PROVIDERS, ...parsed }
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

    const finalSystemPrompt = systemPrompt || `你是一位顶尖的英文学术论文翻译与同行评审专家。
请将用户提供的学术论文内容翻译为信达雅的简体中文：
1. 语言风格严谨、学术、流畅，符合中文顶级学术期刊（如中国科学、计算机学报）规范；
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

    // 4. 公式还原
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
}
