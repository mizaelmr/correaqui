'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X, Loader2, MapPin, AlertCircle, LogIn, Search, Camera } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useOccurrencesStore } from '@/store/occurrences'
import { useCreateOccurrence } from '@/hooks/useOccurrences'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useReverseGeocode } from '@/hooks/useReverseGeocode'
import { uploadPhoto } from '@/services/occurrences'
import { CATEGORY_LABELS, SEVERITY_LABELS } from '@/lib/constants'
import { toast } from 'sonner'
import type { Category, Severity } from '@/types'

const MiniMap = dynamic(() => import('./MiniMap').then((m) => m.MiniMap), {
  ssr: false,
  loading: () => <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />,
})

const schema = z.object({
  category: z.string().min(1, 'Selecione uma categoria'),
  severity: z.string().min(1, 'Selecione a gravidade'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  streetAddress: z.string().min(1, 'Informe o endereço'),
})

type FormData = z.infer<typeof schema>

const PETROLINA_DEFAULT: [number, number] = [-9.3974, -40.5014]

export function NewOccurrenceModal() {
  const { isNewOccurrenceModalOpen, closeNewOccurrenceModal } = useOccurrencesStore()
  const mapCenterFromStore = useOccurrencesStore((s) => s.mapCenter)
  const mapZoomFromStore = useOccurrencesStore((s) => s.mapZoom)
  const searchFilter = useOccurrencesStore((s) => s.filters.search)
  const { data: session } = useSession()
  const router = useRouter()
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined)
  const [miniMapZoom, setMiniMapZoom] = useState(16)
  const suppressAddressSync = useRef(false)
  const fwdGeoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Ref keeps the current searchFilter accessible inside effects without stale closure
  const searchFilterRef = useRef(searchFilter)
  useEffect(() => { searchFilterRef.current = searchFilter }, [searchFilter])

  const createMutation = useCreateOccurrence()
  const { location, error: geoError, loading: geoLoading, getLocation } = useGeolocation()
  const { geocode, addressInfo, loading: geocodeLoading } = useReverseGeocode()

  const { register, handleSubmit, formState: { errors }, reset, control, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const applyStoreCenter = useCallback((center: [number, number], zoom: number) => {
    setMarkerPos(center)
    setMapCenter(center)
    setMiniMapZoom(zoom)
    geocode(center[0], center[1])
  }, [geocode])

  useEffect(() => {
    if (!isNewOccurrenceModalOpen) return

    if (searchFilterRef.current) {
      // Home search active: never call getLocation(). If the store center is already
      // available, apply it now; otherwise the effect below handles the race condition
      // when MapView's async geocode resolves after the modal opens.
      if (mapCenterFromStore) {
        applyStoreCenter(mapCenterFromStore, mapZoomFromStore ?? 13)
      }
    } else {
      getLocation()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNewOccurrenceModalOpen])

  // Race-condition guard: mapCenterFromStore arrives after modal opens (MapView geocode is async)
  useEffect(() => {
    if (!isNewOccurrenceModalOpen || !searchFilter || !mapCenterFromStore || markerPos) return
    applyStoreCenter(mapCenterFromStore, mapZoomFromStore ?? 13)
  }, [mapCenterFromStore, isNewOccurrenceModalOpen, searchFilter, markerPos, mapZoomFromStore, applyStoreCenter])

  // Geolocation success: uses ref to avoid stale closure — never overrides home search
  useEffect(() => {
    if (location && !searchFilterRef.current) {
      const pos: [number, number] = [location.latitude, location.longitude]
      setMarkerPos(pos)
      setMiniMapZoom(16)
      geocode(location.latitude, location.longitude)
    }
  }, [location])

  // Geolocation failure: fall back to store center or Petrolina
  useEffect(() => {
    if (geoError && !markerPos) {
      const fallback: [number, number] = mapCenterFromStore ?? PETROLINA_DEFAULT
      setMarkerPos(fallback)
      setMapCenter(fallback)
      setMiniMapZoom(mapCenterFromStore ? (mapZoomFromStore ?? 13) : 13)
      geocode(fallback[0], fallback[1])
    }
  }, [geoError])

  useEffect(() => {
    if (addressInfo?.address && !suppressAddressSync.current) {
      setValue('streetAddress', addressInfo.address, { shouldValidate: false })
    }
    suppressAddressSync.current = false
  }, [addressInfo, setValue])

  const handleMarkerMove = useCallback(
    (lat: number, lng: number) => {
      setMarkerPos([lat, lng])
      geocode(lat, lng)
    },
    [geocode]
  )

  const [searching, setSearching] = useState(false)
  const streetValue = watch('streetAddress')
  const { ref: streetRef, onChange: streetOnChange, ...streetRest } = register('streetAddress')

  const searchAddress = async () => {
    const value = streetValue?.trim()
    if (!value || value.length < 3) return
    setSearching(true)
    try {
      const bias = markerPos
        ? `&viewbox=${markerPos[1] - 0.5},${markerPos[0] + 0.5},${markerPos[1] + 0.5},${markerPos[0] - 0.5}&countrycodes=br`
        : '&countrycodes=br'
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=1&accept-language=pt-BR${bias}`
      )
      const data = await res.json()
      if (data[0]) {
        const coords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)]
        suppressAddressSync.current = true
        setMarkerPos(coords)
        setMapCenter(coords)
        setMiniMapZoom(16)
        geocode(coords[0], coords[1])
      } else {
        toast.error('Endereço não encontrado. Tente ser mais específico.')
      }
    } catch {
      toast.error('Erro ao buscar endereço.')
    } finally {
      setSearching(false)
    }
  }

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const newPhotos = files.map((file) => ({ file, preview: URL.createObjectURL(file) }))
    setPhotos((prev) => [...prev, ...newPhotos])
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleClose = () => {
    reset({ category: '', severity: '', description: '', streetAddress: '' })
    setPhotos([])
    setMarkerPos(null)
    setMapCenter(undefined)
    setMiniMapZoom(16)
    if (fwdGeoTimer.current) clearTimeout(fwdGeoTimer.current)
    closeNewOccurrenceModal()
  }

  const onSubmit = async (data: FormData) => {
    if (photos.length === 0) {
      toast.error('Adicione pelo menos uma foto da ocorrência.')
      return
    }
    if (!markerPos) {
      toast.error('Localização não detectada. Aguarde ou mova o mapa.')
      return
    }

    setUploading(true)
    try {
      const uploadedUrls: string[] = []
      for (const p of photos) {
        const result = await uploadPhoto(p.file)
        uploadedUrls.push(result.url)
      }

      const categoryLabels: Record<string, string> = CATEGORY_LABELS
      const title = `${CATEGORY_LABELS[data.category as Category]} - ${addressInfo?.neighborhood || addressInfo?.city || 'Sem localização'}`

      await createMutation.mutateAsync({
        title,
        description: data.description,
        category: data.category as Category,
        severity: data.severity as Severity,
        latitude: markerPos[0],
        longitude: markerPos[1],
        address: data.streetAddress,
        neighborhood: addressInfo?.neighborhood,
        city: addressInfo?.city,
        state: addressInfo?.state,
        photos: uploadedUrls,
      })

      toast.success('Ocorrência registrada com sucesso!')
      handleClose()
    } catch {
      toast.error('Erro ao registrar ocorrência.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={isNewOccurrenceModalOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Nova Ocorrência
          </DialogTitle>
        </DialogHeader>

        {!session ? (
          <div className="py-10 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
              <LogIn className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Login necessário</p>
              <p className="text-sm text-gray-500 max-w-xs">
                Para registrar uma ocorrência você precisa estar conectado à sua conta.
              </p>
            </div>
            <div className="flex gap-3 mt-1">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => { handleClose(); router.push('/login') }}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Entrar
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Não tem conta?{' '}
              <button
                type="button"
                onClick={() => { handleClose(); router.push('/cadastro') }}
                className="text-blue-600 hover:underline"
              >
                Cadastre-se grátis
              </button>
            </p>
          </div>
        ) : (

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">
                Categoria <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium mb-1.5 block">
                Gravidade <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="severity"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={errors.severity ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(SEVERITY_LABELS) as [Severity, string][]).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.severity && (
                <p className="text-xs text-red-500 mt-1">{errors.severity.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-1.5 block">
              Descrição <span className="text-red-500">*</span>
            </Label>
            <Textarea
              placeholder="Descreva o problema com detalhes..."
              className={`text-sm ${errors.description ? 'border-red-500' : ''}`}
              rows={3}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium mb-1.5 block">
              Localização <span className="text-red-500">*</span>
            </Label>
            {geoLoading ? (
              <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-400">Obtendo localização...</span>
              </div>
            ) : markerPos ? (
              <MiniMap position={markerPos} center={mapCenter} zoom={miniMapZoom} onMarkerMove={handleMarkerMove} />
            ) : (
              <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-400">
                <AlertCircle className="w-4 h-4 mr-1.5" />
                Não foi possível obter localização
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1 mb-2">Arraste o marcador ou busque pelo endereço.</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <Input
                  placeholder="Nome da rua e número"
                  className={`pl-8 pr-2 text-sm ${errors.streetAddress ? 'border-red-500' : ''}`}
                  onChange={streetOnChange}
                  ref={streetRef}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchAddress())}
                  {...streetRest}
                />
              </div>
              <button
                type="button"
                onClick={searchAddress}
                disabled={searching || geocodeLoading}
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                title="Buscar endereço"
              >
                {searching ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                ) : (
                  <Search className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
            {errors.streetAddress && (
              <p className="text-xs text-red-500 mt-1">{errors.streetAddress.message}</p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium mb-1.5 block">
              Fotos <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {photos.map((p, i) => (
                <div key={i} className="relative">
                  <img src={p.preview} alt="" className="w-full h-16 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
              <label className="h-16 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors sm:hidden">
                <Camera className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400 mt-0.5">Câmera</span>
                <input
                  type="file"
                  accept="image/*"
                  capture
                  className="hidden"
                  onChange={handleFilesChange}
                />
              </label>
              <label className="h-16 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
                <Upload className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400 mt-0.5 sm:hidden">Galeria</span>
                <span className="text-xs text-gray-400 mt-0.5 hidden sm:block">Foto</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFilesChange}
                />
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={uploading || createMutation.isPending}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Registrar Ocorrência'
              )}
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
