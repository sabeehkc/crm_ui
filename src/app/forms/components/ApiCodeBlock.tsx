'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Copy } from 'lucide-react'

interface ApiCodeBlockProps {
  code: string
  language: string
}

export function ApiCodeBlock({ code, language }: ApiCodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative rounded-xl overflow-hidden bg-slate-950 text-slate-50 border border-slate-800 shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/50 border-b border-slate-800 text-xs font-medium text-slate-400">
        <span>{language}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 hover:bg-slate-800 text-slate-400 hover:text-slate-100"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-sm leading-relaxed whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  )
}
