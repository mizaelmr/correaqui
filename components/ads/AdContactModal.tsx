'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Megaphone, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AdContactModalProps {
  open: boolean
  onClose: () => void
}

export function AdContactModal({ open, onClose }: AdContactModalProps) {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !contact.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/contact/ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact, message }),
      })
      if (!res.ok) throw new Error()
      toast.success('Mensagem enviada! Entraremos em contato em breve.')
      setName('')
      setContact('')
      setMessage('')
      onClose()
    } catch {
      toast.error('Erro ao enviar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <Megaphone className="w-4 h-4 text-white" />
            </div>
            <DialogTitle className="text-base">Anuncie no CORRE AQUI PREFEITO</DialogTitle>
          </div>
          <p className="text-xs text-gray-500 mt-1 leading-snug">
            Alcance moradores e comerciantes da região. Preencha seus dados e entraremos em contato.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">
              Assunto
            </Label>
            <Input
              value="Interesse em anúncio"
              readOnly
              className="bg-gray-50 text-gray-500 text-sm"
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-1.5 block">
              Seu nome <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Nome ou razão social"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-sm"
              required
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-1.5 block">
              E-mail ou WhatsApp <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="seu@email.com ou (87) 99999-9999"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="text-sm"
              required
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-1.5 block">
              Mensagem <span className="text-gray-400 font-normal">(opcional)</span>
            </Label>
            <Textarea
              placeholder="Conte um pouco sobre seu negócio e o que procura..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="text-sm resize-none"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading || !name.trim() || !contact.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
