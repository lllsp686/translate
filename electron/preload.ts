import { contextBridge } from 'electron'

// 暴露安全上下文 API
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
})
