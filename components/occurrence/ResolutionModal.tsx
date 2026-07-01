'use client'

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X, Loader2, Camera } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRequestResolution } from '@/hooks/useOccurrences'
import { uploadMedia } from '@/services/occurrences'
import { toast } from 'sonner'

const schema = z.object({
  comment: z.string().optional(),
  reporterName: z.string().optional(),
  reporterPhone: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface ResolutionModalProps {
  occurrenceId: string
  open: boolean
  onClose: () => void
}

export function ResolutionModal({ occurrenceId, open, onClose }: ResolutionModalProps) {
  const [photos, setPhotos] = useState<{ file: File; preview: string; url?: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const resolveMutation = useRequestResolution()

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const handleFilesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const newPhotos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setPhotos((prev) => [...prev, ...newPhotos])
  }, [])

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const onSubmit = async (data: FormData) => {
    if (photos.length === 0) {
      toast.error('Adicione pelo menos uma foto como evidência.')
      return
    }

    setUploading(true)
    try {
      const uploadedUrls: string[] = []
      for (const p of photos) {
        const result = await uploadMedia(p.file)
        uploadedUrls.push(result.url)
      }

      await resolveMutation.mutateAsync({
        id: occurrenceId,
        data: { ...data, photos: uploadedUrls },
      })

      toast.success('Solicitação enviada! A resolução será validada em breve.')
      reset()
      setPhotos([])
      onClose()
    } catch {
      toast.error('Erro ao enviar solicitação.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Informar Resolução</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Fotos como evidência <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {photos.map((p, i) => (
                <div key={i} className="relative">
                  <img src={p.preview} alt="" className="w-full h-20 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors sm:hidden">
                <Camera className="w-5 h-5 text-gray-400" />
                <span className="text-xs text-gray-400 mt-1">Câmera</span>
                <input
                  type="file"
                  accept="image/*"
                  capture
                  className="hidden"
                  onChange={handleFilesChange}
                />
              </label>
              <label className="h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-xs text-gray-400 mt-1 sm:hidden">Galeria</span>
                <span className="text-xs text-gray-400 mt-1 hidden sm:block">Adicionar</span>
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

          <div>
            <Label htmlFor="comment" className="text-sm font-medium mb-1.5 block">Comentário</Label>
            <Textarea
              id="comment"
              placeholder="Descreva como o problema foi resolvido..."
              className="text-sm"
              rows={3}
              {...register('comment')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="reporterName" className="text-sm font-medium mb-1.5 block">
                Nome <span className="text-gray-400 font-normal">(opcional)</span>
              </Label>
              <Input
                id="reporterName"
                placeholder="Seu nome"
                className="text-sm"
                {...register('reporterName')}
              />
            </div>
            <div>
              <Label htmlFor="reporterPhone" className="text-sm font-medium mb-1.5 block">
                Telefone <span className="text-gray-400 font-normal">(opcional)</span>
              </Label>
              <Input
                id="reporterPhone"
                placeholder="(00) 00000-0000"
                className="text-sm"
                {...register('reporterPhone')}
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
            Após envio, a ocorrência ficará com status &quot;Aguardando Validação&quot; até ser
            aprovada por nossa equipe.
          </p>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={uploading || resolveMutation.isPending}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
