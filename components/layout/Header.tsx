'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useOccurrencesStore } from '@/store/occurrences'

export function Header() {
  const [searchValue, setSearchValue] = useState('')
  const setFilters = useOccurrencesStore((s) => s.setFilters)
  const filters = useOccurrencesStore((s) => s.filters)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setFilters({ ...filters, search: searchValue.trim() || undefined })
    }, 400)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue])

  const handleClear = () => {
    setSearchValue('')
    setFilters({ ...filters, search: undefined })
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm h-14">
      <div className="flex items-center h-full px-4 gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900 hidden sm:block">CorreAqui</span>
        </div>

        <div className="flex-1 max-w-xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Pesquisar por cidade, bairro, endereço ou categoria..."
            className="pl-9 pr-8 bg-gray-50 border-gray-200 h-9 text-sm"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          {searchValue && (
            <button
              onClick={handleClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <span className="hidden md:block text-sm font-medium text-blue-600 shrink-0">
          Sua cidade, sua voz.
        </span>
      </div>
    </header>
  )
}
