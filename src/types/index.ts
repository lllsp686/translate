export type BlockType = 
  | 'title' 
  | 'author' 
  | 'affiliation' 
  | 'abstract' 
  | 'heading' 
  | 'paragraph' 
  | 'equation' 
  | 'figure' 
  | 'table' 
  | 'reference'

export interface FigureTextItem {
  id: string
  bbox: [number, number, number, number] // [x0, y0, x1, y1] in percentage of image (0-100)
  original: string
  translated: string
  fontSize?: number
}

export interface FigureBlockData {
  imageUrl: string
  captionOriginal: string
  captionTranslated?: string
  width: number
  height: number
  textItems: FigureTextItem[]
}

export interface TableCell {
  original: string
  translated: string
  isHeader?: boolean
  colSpan?: number
  rowSpan?: number
}

export interface TableBlockData {
  captionOriginal: string
  captionTranslated?: string
  rows: TableCell[][]
}

export interface DocumentBlock {
  id: string
  pageNumber: number
  type: BlockType
  column: 1 | 2 | 'full'
  originalText: string
  translatedText?: string
  status: 'idle' | 'translating' | 'completed' | 'error'
  errorMessage?: string
  figureData?: FigureBlockData
  tableData?: TableBlockData
  bbox?: [number, number, number, number] // bounding box in page
}

export interface PaperDocument {
  id: string
  fileName: string
  fileSize: number
  pageCount: number
  title: string
  authors?: string[]
  publishedYear?: string
  blocks: DocumentBlock[]
  createdAt: number
  updatedAt: number
}

export type APIProvider = 
  | 'deepseek'
  | 'kimi'
  | 'mimo'
  | 'glm'
  | 'qwen'
  | 'openai'
  | 'claude'
  | 'gemini'
  | 'custom'

export interface APIConfig {
  provider: APIProvider
  name: string
  apiKey: string
  baseUrl: string
  model: string
  enabled: boolean
  availableModels: string[]
  supportsStreaming: boolean
  latencyMs?: number
  lastChecked?: number
}

export type OverlayMode = 'all' | 'hover' | 'original'

export type ViewLayoutMode = 'bilingual-split' | 'translation-only' | 'original-only'

export interface GlossaryItem {
  id: string
  source: string
  target: string
  domain: string
}
