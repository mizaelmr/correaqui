'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOccurrencesStore } from '@/store/occurrences'

export function FloatingButton() {
  const openNewOccurrenceModal = useOccurrencesStore((s) => s.openNewOccurrenceModal)

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[2000]">
      <Button
        onClick={openNewOccurrenceModal}
        size="lg"
        className="rounded-full shadow-lg hover:shadow-xl transition-all gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 h-12"
      >
        <Plus className="w-5 h-5" />
        <span className="font-semibold">Registrar Ocorrência</span>
      </Button>
    </div>
  )
}
