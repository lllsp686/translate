import type { PaperDocument } from '../types'

const DB_NAME = 'PaperLensDB'
const DB_VERSION = 1
const STORE_DOCUMENTS = 'documents'
const STORE_META = 'meta'

class StorageService {
  private dbPromise: Promise<IDBDatabase> | null = null

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains(STORE_DOCUMENTS)) {
          db.createObjectStore(STORE_DOCUMENTS, { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains(STORE_META)) {
          db.createObjectStore(STORE_META, { keyPath: 'key' })
        }
      }

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        reject(request.error)
      }
    })

    return this.dbPromise
  }

  // 获取所有文献
  async getAllDocuments(): Promise<PaperDocument[]> {
    try {
      const db = await this.getDB()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_DOCUMENTS], 'readonly')
        const store = transaction.objectStore(STORE_DOCUMENTS)
        const request = store.getAll()

        request.onsuccess = () => {
          resolve(request.result || [])
        }
        request.onerror = () => reject(request.error)
      })
    } catch (err) {
      console.error('IndexedDB getAllDocuments error:', err)
      return []
    }
  }

  // 保存或更新单篇文献
  async saveDocument(doc: PaperDocument): Promise<void> {
    try {
      const db = await this.getDB()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_DOCUMENTS], 'readwrite')
        const store = transaction.objectStore(STORE_DOCUMENTS)
        const request = store.put(doc)

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    } catch (err) {
      console.error('IndexedDB saveDocument error:', err)
    }
  }

  // 批量保存文献
  async saveDocuments(docs: PaperDocument[]): Promise<void> {
    try {
      const db = await this.getDB()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_DOCUMENTS], 'readwrite')
        const store = transaction.objectStore(STORE_DOCUMENTS)
        docs.forEach((doc) => store.put(doc))

        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
      })
    } catch (err) {
      console.error('IndexedDB saveDocuments error:', err)
    }
  }

  // 删除单篇文献
  async deleteDocument(id: string): Promise<void> {
    try {
      const db = await this.getDB()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_DOCUMENTS], 'readwrite')
        const store = transaction.objectStore(STORE_DOCUMENTS)
        const request = store.delete(id)

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    } catch (err) {
      console.error('IndexedDB deleteDocument error:', err)
    }
  }

  // 获取分类列表
  async getCategories(): Promise<string[]> {
    try {
      const db = await this.getDB()
      return new Promise((resolve) => {
        const transaction = db.transaction([STORE_META], 'readonly')
        const store = transaction.objectStore(STORE_META)
        const request = store.get('categories')

        request.onsuccess = () => {
          if (request.result && Array.isArray(request.result.value)) {
            resolve(request.result.value)
          } else {
            resolve(['默认分类', '精读文献', '综述论文', '实验参考'])
          }
        }
        request.onerror = () => resolve(['默认分类', '精读文献', '综述论文', '实验参考'])
      })
    } catch {
      return ['默认分类', '精读文献', '综述论文', '实验参考']
    }
  }

  // 保存分类列表
  async saveCategories(categories: string[]): Promise<void> {
    try {
      const db = await this.getDB()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_META], 'readwrite')
        const store = transaction.objectStore(STORE_META)
        const request = store.put({ key: 'categories', value: categories })

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    } catch (err) {
      console.error('IndexedDB saveCategories error:', err)
    }
  }

  // 获取上次阅读的文献ID
  async getLastActiveDocId(): Promise<string | null> {
    try {
      const db = await this.getDB()
      return new Promise((resolve) => {
        const transaction = db.transaction([STORE_META], 'readonly')
        const store = transaction.objectStore(STORE_META)
        const request = store.get('lastActiveDocId')

        request.onsuccess = () => {
          resolve(request.result ? request.result.value : null)
        }
        request.onerror = () => resolve(null)
      })
    } catch {
      return null
    }
  }

  // 记录上次阅读的文献ID
  async setLastActiveDocId(id: string): Promise<void> {
    try {
      const db = await this.getDB()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_META], 'readwrite')
        const store = transaction.objectStore(STORE_META)
        const request = store.put({ key: 'lastActiveDocId', value: id })

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    } catch (err) {
      console.error('IndexedDB setLastActiveDocId error:', err)
    }
  }
}

export const LocalStorageDB = new StorageService()
