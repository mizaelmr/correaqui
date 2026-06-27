'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  phone: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface ProfileFormProps {
  user: { name: string; email: string; phone?: string | null }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: user.name, phone: user.phone ?? '' },
  })

  const onSubmit = async (data: FormData) => {
    const res = await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) { toast.error('Erro ao salvar.'); return }
    toast.success('Perfil atualizado!')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div>
        <Label htmlFor="name">Nome completo</Label>
        <Input id="name" className={`mt-1 ${errors.name ? 'border-red-500' : ''}`} {...register('name')} />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" value={user.email} disabled className="mt-1 bg-gray-50 text-gray-400" />
        <p className="text-xs text-gray-400 mt-1">O e-mail não pode ser alterado.</p>
      </div>

      <div>
        <Label htmlFor="phone">Telefone</Label>
        <Input id="phone" placeholder="(00) 00000-0000" className="mt-1" {...register('phone')} />
      </div>

      <Button type="submit" disabled={isSubmitting || !isDirty}>
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar alterações'}
      </Button>
    </form>
  )
}
