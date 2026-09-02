import React, { useMemo } from 'react'
import katex from 'katex'

interface MathRendererProps {
  content: string
  className?: string
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  const parts = useMemo(() => {
    // 解析行间公式 $$ ... $$ 和 行内公式 $ ... $
    const result: Array<{ type: 'text' | 'inline-math' | 'block-math'; value: string }> = []
    
    // 正则匹配公式
    const regex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/g
    let lastIndex = 0
    let match

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        result.push({
          type: 'text',
          value: content.slice(lastIndex, match.index),
        })
      }

      const matchStr = match[0]
      if (matchStr.startsWith('$$')) {
        result.push({
          type: 'block-math',
          value: matchStr.slice(2, -2).trim(),
        })
      } else {
        result.push({
          type: 'inline-math',
          value: matchStr.slice(1, -1).trim(),
        })
      }

      lastIndex = regex.lastIndex
    }

    if (lastIndex < content.length) {
      result.push({
        type: 'text',
        value: content.slice(lastIndex),
      })
    }

    return result
  }, [content])

  return (
    <span className={`inline-math-container leading-relaxed ${className}`}>
      {parts.map((part, idx) => {
        if (part.type === 'text') {
          return <span key={idx}>{part.value}</span>
        }

        try {
          const html = katex.renderToString(part.value, {
            displayMode: part.type === 'block-math',
            throwOnError: false,
          })

          if (part.type === 'block-math') {
            return (
              <span
                key={idx}
                className="my-3 block overflow-x-auto py-2 text-center"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            )
          }

          return (
            <span
              key={idx}
              className="inline-block px-1 align-baseline"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )
        } catch {
          return <code key={idx} className="text-red-500 font-mono text-xs">{part.value}</code>
        }
      })}
    </span>
  )
}
