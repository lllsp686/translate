// 1. MUST BE FIRST: Load polyfill before worker executes
import './toHexPolyfill'

// 2. Load PDF.js worker
import 'pdfjs-dist/build/pdf.worker.mjs'
