'use client'

import { useState, useTransition } from 'react'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants'
import { toast } from 'sonner'

const STATUSES = ['ABERTA', 'EM_ANALISE', 'AGUARDANDO_VALIDACAO', 'RESOLVIDA'] as const

interface Props {
  occurrenceId: string
  currentStatus: string
}

export function StatusSelector({ occurrenceId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus)
  const [isPending, startTransition] = useTransition()

  const handleChange = (newStatus: string) => {
    if (newStatus === status) return
    startTransition(async () => {
      const res = await fetch(`/api/admin/occurrences/${occurrenceId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setStatus(newStatus)
        toast.success('Status atualizado')
      } else {
        toast.error('Erro ao atualizar status')
      }
    })
  }

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value)}
      disabled={isPending}
      className={`text-xs px-2 py-1 rounded-full border font-medium cursor-pointer focus:outline-none disabled:opacity-60 ${STATUS_COLORS[status as keyof typeof STATUS_COLORS]}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  )
}
