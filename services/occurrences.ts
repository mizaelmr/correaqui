import type { Occurrence, CreateOccurrenceInput, OccurrenceFilters } from '@/types'

const API_BASE = '/api/occurrences'

export async function fetchOccurrences(filters?: OccurrenceFilters): Promise<Occurrence[]> {
  const params = new URLSearchParams()
  if (filters?.category) params.set('category', filters.category)
  if (filters?.severity) params.set('severity', filters.severity)
  if (filters?.status) params.set('status', filters.status)
  if (filters?.neighborhood) params.set('neighborhood', filters.neighborhood)
  if (filters?.search) params.set('search', filters.search)

  const url = `${API_BASE}${params.toString() ? `?${params}` : ''}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Erro ao buscar ocorrências')
  return res.json()
}

export async function fetchOccurrenceById(id: string): Promise<Occurrence> {
  const res = await fetch(`${API_BASE}/${id}`)
  if (!res.ok) throw new Error('Ocorrência não encontrada')
  return res.json()
}

export async function createOccurrence(data: CreateOccurrenceInput): Promise<Occurrence> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Erro ao criar ocorrência')
  return res.json()
}

export async function confirmOccurrence(id: string): Promise<Occurrence> {
  const res = await fetch(`${API_BASE}/${id}/confirm`, { method: 'POST' })
  if (!res.ok) throw new Error('Erro ao confirmar ocorrência')
  return res.json()
}

export async function requestResolution(
  id: string,
  data: { comment?: string; reporterName?: string; reporterPhone?: string; photos: string[] }
): Promise<Occurrence> {
  const res = await fetch(`${API_BASE}/${id}/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Erro ao solicitar resolução')
  return res.json()
}

export async function uploadMedia(file: File): Promise<{ url: string; type: 'image' | 'video' }> {
  const formData = new FormData()

  if (file.type.startsWith('image/')) {
    const { compressImage } = await import('@/lib/imageCompress')
    const compressed = await compressImage(file)
    formData.append('file', compressed, 'photo.webp')
  } else {
    formData.append('file', file)
  }

  const res = await fetch('/api/upload', { method: 'POST', body: formData })
  if (!res.ok) throw new Error('Erro ao fazer upload')
  return res.json()
}
