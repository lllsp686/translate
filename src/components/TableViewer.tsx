import React, { useState } from 'react'
import type { TableBlockData } from '../types'
import { Table as TableIcon, ArrowRightLeft } from 'lucide-react'

interface TableViewerProps {
  table: TableBlockData
}

export const TableViewer: React.FC<TableViewerProps> = ({ table }) => {
  const [showChinese, setShowChinese] = useState(true)

  return (
    <div className="my-6 rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900/50 p-4 transition-all">
      {/* 顶部标题与切换栏 */}
      <div className="mb-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-medium text-neutral-700 dark:text-neutral-300">
          <TableIcon className="h-3.5 w-3.5 text-blue-500" />
          <span>结构化学术表格</span>
          <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            原版表格结构保留
          </span>
        </div>

        <button
          onClick={() => setShowChinese(!showChinese)}
          className="flex items-center gap-1 rounded-md bg-black/5 dark:bg-white/10 px-2 py-1 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-all"
        >
          <ArrowRightLeft className="h-3 w-3" />
          <span>{showChinese ? '显示中英对照' : '仅看中文'}</span>
        </button>
      </div>

      {/* 表格容器 */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            {table.rows
              .filter((r) => r.some((c) => c.isHeader))
              .map((row, rIdx) => (
                <tr key={rIdx} className="border-t-2 border-b-2 border-neutral-800 dark:border-neutral-200">
                  {row.map((cell, cIdx) => (
                    <th key={cIdx} className="py-2.5 px-3 font-semibold text-neutral-900 dark:text-neutral-100">
                      <div>{cell.translated || cell.original}</div>
                      {showChinese && cell.translated && (
                        <div className="text-[10px] font-normal text-neutral-400 dark:text-neutral-500">
                          {cell.original}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
          </thead>
          <tbody>
            {table.rows
              .filter((r) => !r.some((c) => c.isHeader))
              .map((row, rIdx, arr) => (
                <tr
                  key={rIdx}
                  className={`border-b border-neutral-200/70 dark:border-neutral-800/80 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors ${
                    rIdx === arr.length - 1 ? 'border-b-2 border-neutral-800 dark:border-neutral-200' : ''
                  }`}
                >
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="py-2 px-3 text-neutral-700 dark:text-neutral-300 font-mono text-[11px]">
                      <div>{cell.translated || cell.original}</div>
                      {showChinese && cell.translated && cell.translated !== cell.original && (
                        <div className="text-[10px] text-neutral-400 font-sans">{cell.original}</div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* 表注 */}
      <div className="mt-2.5 text-[11px] text-neutral-500 dark:text-neutral-400">
        <span className="font-semibold text-neutral-700 dark:text-neutral-300">表注：</span>
        <span>{table.captionTranslated || table.captionOriginal}</span>
      </div>
    </div>
  )
}
