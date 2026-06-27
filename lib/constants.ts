import type { Category, Severity, OccurrenceStatus } from '@/types'

export const CATEGORY_LABELS: Record<Category, string> = {
  BURACO: 'Buraco',
  RUA_ALAGADA: 'Rua Alagada',
  LIXO_ACUMULADO: 'Lixo Acumulado',
  ILUMINACAO_PUBLICA: 'Iluminação Pública',
  VAZAMENTO_AGUA: 'Vazamento de Água',
  ESGOTO: 'Esgoto',
  ARVORE_CAIDA: 'Árvore Caída',
  OBRA_ABANDONADA: 'Obra Abandonada',
  OUTRO: 'Outro',
}

export const CATEGORY_ICONS: Record<Category, string> = {
  BURACO: '🕳️',
  RUA_ALAGADA: '🌊',
  LIXO_ACUMULADO: '🗑️',
  ILUMINACAO_PUBLICA: '💡',
  VAZAMENTO_AGUA: '💧',
  ESGOTO: '🚰',
  ARVORE_CAIDA: '🌳',
  OBRA_ABANDONADA: '🏗️',
  OUTRO: '⚠️',
}

export const SEVERITY_LABELS: Record<Severity, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  CRITICA: 'Crítica',
}

export const SEVERITY_COLORS: Record<Severity, string> = {
  BAIXA: '#22c55e',
  MEDIA: '#eab308',
  ALTA: '#f97316',
  CRITICA: '#ef4444',
}

export const SEVERITY_BG_COLORS: Record<Severity, string> = {
  BAIXA: 'bg-green-500',
  MEDIA: 'bg-yellow-500',
  ALTA: 'bg-orange-500',
  CRITICA: 'bg-red-500',
}

export const SEVERITY_TEXT_COLORS: Record<Severity, string> = {
  BAIXA: 'text-green-700',
  MEDIA: 'text-yellow-700',
  ALTA: 'text-orange-700',
  CRITICA: 'text-red-700',
}

export const SEVERITY_BADGE_VARIANTS: Record<Severity, string> = {
  BAIXA: 'bg-green-100 text-green-800 border-green-200',
  MEDIA: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ALTA: 'bg-orange-100 text-orange-800 border-orange-200',
  CRITICA: 'bg-red-100 text-red-800 border-red-200',
}

export const STATUS_LABELS: Record<OccurrenceStatus, string> = {
  ABERTA: 'Aberta',
  EM_ANALISE: 'Em Análise',
  AGUARDANDO_VALIDACAO: 'Aguardando Validação',
  RESOLVIDA: 'Resolvida',
}

export const STATUS_COLORS: Record<OccurrenceStatus, string> = {
  ABERTA: 'bg-blue-100 text-blue-800 border-blue-200',
  EM_ANALISE: 'bg-purple-100 text-purple-800 border-purple-200',
  AGUARDANDO_VALIDACAO: 'bg-amber-100 text-amber-800 border-amber-200',
  RESOLVIDA: 'bg-green-100 text-green-800 border-green-200',
}

export const TIME_BANDS = [
  { max: 7, label: 'Recente', color: '#22c55e', emoji: '🟢' },
  { max: 30, label: 'Atenção', color: '#eab308', emoji: '🟡' },
  { max: 90, label: 'Antiga', color: '#f97316', emoji: '🟠' },
  { max: Infinity, label: 'Crítica', color: '#ef4444', emoji: '🔴' },
]

export const DEFAULT_MAP_CENTER: [number, number] = [-9.3958, -40.4978]
export const DEFAULT_MAP_ZOOM = 13
