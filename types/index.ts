export type Category =
  | 'BURACO'
  | 'RUA_ALAGADA'
  | 'LIXO_ACUMULADO'
  | 'ILUMINACAO_PUBLICA'
  | 'VAZAMENTO_AGUA'
  | 'ESGOTO'
  | 'ARVORE_CAIDA'
  | 'OBRA_ABANDONADA'
  | 'OUTRO'

export type Severity = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA'

export type OccurrenceStatus =
  | 'ABERTA'
  | 'EM_ANALISE'
  | 'AGUARDANDO_VALIDACAO'
  | 'RESOLVIDA'

export type TimelineEventType =
  | 'CRIADA'
  | 'FOTOS_ADICIONADAS'
  | 'CONFIRMADA'
  | 'STATUS_ALTERADO'
  | 'RESOLUCAO_SOLICITADA'
  | 'RESOLUCAO_APROVADA'

export interface Photo {
  id: string
  url: string
  occurrenceId: string
  createdAt: string
}

export interface TimelineEvent {
  id: string
  type: TimelineEventType
  description: string
  occurrenceId: string
  createdAt: string
}

export interface Occurrence {
  id: string
  title: string
  description: string
  category: Category
  severity: Severity
  status: OccurrenceStatus
  latitude: number
  longitude: number
  address: string
  neighborhood?: string | null
  city?: string | null
  state?: string | null
  reporterName?: string | null
  reporterPhone?: string | null
  confirmations: number
  photos: Photo[]
  timeline: TimelineEvent[]
  createdAt: string
  updatedAt: string
}

export interface CreateOccurrenceInput {
  title: string
  description: string
  category: Category
  severity: Severity
  latitude: number
  longitude: number
  address: string
  neighborhood?: string
  city?: string
  state?: string
  reporterName?: string
  reporterPhone?: string
  photos: string[]
}

export interface OccurrenceFilters {
  category?: Category
  severity?: Severity
  status?: OccurrenceStatus
  neighborhood?: string
  search?: string
}

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

export interface GeoLocation {
  latitude: number
  longitude: number
}
