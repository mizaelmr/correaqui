import { create } from 'zustand'
import type { Occurrence, OccurrenceFilters } from '@/types'

interface OccurrencesState {
  selectedOccurrence: Occurrence | null
  hoveredOccurrence: string | null
  filters: OccurrenceFilters
  mapCenter: [number, number] | null
  mapZoom: number | null
  isNewOccurrenceModalOpen: boolean
  isOccurrenceModalOpen: boolean

  setSelectedOccurrence: (occurrence: Occurrence | null) => void
  setHoveredOccurrence: (id: string | null) => void
  setFilters: (filters: OccurrenceFilters) => void
  setMapCenter: (center: [number, number]) => void
  setMapZoom: (zoom: number) => void
  openNewOccurrenceModal: () => void
  closeNewOccurrenceModal: () => void
  openOccurrenceModal: (occurrence: Occurrence) => void
  closeOccurrenceModal: () => void
}

export const useOccurrencesStore = create<OccurrencesState>((set) => ({
  selectedOccurrence: null,
  hoveredOccurrence: null,
  filters: {},
  mapCenter: null,
  mapZoom: null,
  isNewOccurrenceModalOpen: false,
  isOccurrenceModalOpen: false,

  setSelectedOccurrence: (occurrence) =>
    set({ selectedOccurrence: occurrence }),

  setHoveredOccurrence: (id) => set({ hoveredOccurrence: id }),

  setFilters: (filters) => set({ filters }),

  setMapCenter: (center) => set({ mapCenter: center }),

  setMapZoom: (zoom) => set({ mapZoom: zoom }),

  openNewOccurrenceModal: () => set({ isNewOccurrenceModalOpen: true }),

  closeNewOccurrenceModal: () => set({ isNewOccurrenceModalOpen: false }),

  openOccurrenceModal: (occurrence) =>
    set({ selectedOccurrence: occurrence, isOccurrenceModalOpen: true }),

  closeOccurrenceModal: () =>
    set({ isOccurrenceModalOpen: false }),
}))
