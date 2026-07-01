'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchOccurrences,
  fetchOccurrenceById,
  createOccurrence,
  confirmOccurrence,
  requestResolution,
} from '@/services/occurrences'
import { useOccurrencesStore } from '@/store/occurrences'
import type { OccurrenceFilters, CreateOccurrenceInput } from '@/types'

export function useOccurrences(filters?: OccurrenceFilters) {
  return useQuery({
    queryKey: ['occurrences', filters],
    queryFn: () => fetchOccurrences(filters),
    staleTime: 30_000,
  })
}

export function useOccurrence(id: string) {
  return useQuery({
    queryKey: ['occurrences', id],
    queryFn: () => fetchOccurrenceById(id),
    enabled: !!id,
  })
}

export function useCreateOccurrence() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateOccurrenceInput) => createOccurrence(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['occurrences'] }),
  })
}

export function useConfirmOccurrence() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => confirmOccurrence(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['occurrences'] })
      // Keep the modal in sync without requiring close/reopen
      const { selectedOccurrence, setSelectedOccurrence } = useOccurrencesStore.getState()
      if (selectedOccurrence?.id === id) {
        setSelectedOccurrence({ ...selectedOccurrence, confirmations: selectedOccurrence.confirmations + 1 })
      }
    },
  })
}

export function useRequestResolution() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: { comment?: string; reporterName?: string; reporterPhone?: string; photos: string[] }
    }) => requestResolution(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['occurrences'] }),
  })
}
