'use client'

import { useState, useEffect } from 'react'
import { Share2, Copy, Check, MessageCircle } from 'lucide-react'

interface Props {
  path: string
  title: string
  address: string
}

export function ShareButtons({ path, title, address }: Props) {
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const url = origin ? `${origin}${path}` : path

  const waText = encodeURIComponent(`🚨 *${title}*\n📍 ${address}\n\nVeja no correAquiPrefeito: ${url}`)
  const waUrl = `https://wa.me/?text=${waText}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}${path}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="w-4 h-4 text-gray-500" />
        <h2 className="text-sm font-semibold text-gray-700">Compartilhar ocorrência</h2>
      </div>
      <div className="flex gap-2">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copiar link
            </>
          )}
        </button>
      </div>
    </div>
  )
}
