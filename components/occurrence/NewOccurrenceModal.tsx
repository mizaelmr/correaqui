'use client'

import { useState, useCallback, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X, Loader2, MapPin, AlertCircle } from 'lucide-react'
import dynamic from 'next/dynamic'
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
  reporterName: z.string().optional(),
  reporterPhone: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function NewOccurrenceModal() {
  const { isNewOccurrenceModalOpen, closeNewOccurrenceModal } = useOccurrencesStore()
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null)

  const createMutation = useCreateOccurrence()
  const { location, loading: geoLoading, getLocation } = useGeolocation()
  const { geocode, addressInfo, loading: geocodeLoading } = useReverseGeocode()

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (isNewOccurrenceModalOpen) {
      getLocation()
    }
  }, [isNewOccurrenceModalOpen])

  useEffect(() => {
    if (location) {
      const pos: [number, number] = [location.latitude, location.longitude]
      setMarkerPos(pos)
      geocode(location.latitude, location.longitude)
    }
  }, [location])

  const handleMarkerMove = useCallback(
    (lat: number, lng: number) => {
      setMarkerPos([lat, lng])
      geocode(lat, lng)
    },
    [geocode]
  )

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
    reset()
    setPhotos([])
    setMarkerPos(null)
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
        address: addressInfo?.address || 'Endereço não identificado',
        neighborhood: addressInfo?.neighborhood,
        city: addressInfo?.city,
        state: addressInfo?.state,
        reporterName: data.reporterName,
        reporterPhone: data.reporterPhone,
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
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Nova Ocorrência
          </DialogTitle>
        </DialogHeader>

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
              <MiniMap position={markerPos} onMarkerMove={handleMarkerMove} />
            ) : (
              <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-400">
                <AlertCircle className="w-4 h-4 mr-1.5" />
                Não foi possível obter localização
              </div>
            )}
            {addressInfo && !geocodeLoading && (
              <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {addressInfo.address}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">Arraste o marcador para ajustar a posição exata.</p>
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
              <label className="h-16 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
                <Upload className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400 mt-0.5">Foto</span>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">
                Nome <span className="text-gray-400 font-normal text-xs">(opcional)</span>
              </Label>
              <Input placeholder="Seu nome" className="text-sm" {...register('reporterName')} />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">
                Telefone <span className="text-gray-400 font-normal text-xs">(opcional)</span>
              </Label>
              <Input placeholder="(00) 00000-0000" className="text-sm" {...register('reporterPhone')} />
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800">
              🔒 Seu nome e telefone nunca serão exibidos publicamente. Essas informações
              poderão ser utilizadas apenas para contato caso seja necessário obter mais detalhes
              da ocorrência.
            </p>
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
      </DialogContent>
    </Dialog>
  )
}
