'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Obrigatório'),
    newPassword: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export function PasswordForm() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    const res = await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'password', ...data }),
    })
    if (!res.ok) {
      const body = await res.json()
      toast.error(body.error || 'Erro ao alterar senha.')
      return
    }
    toast.success('Senha alterada com sucesso!')
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div>
        <Label htmlFor="currentPassword">Senha atual</Label>
        <Input id="currentPassword" type="password" className={`mt-1 ${errors.currentPassword ? 'border-red-500' : ''}`} {...register('currentPassword')} />
        {errors.currentPassword && <p className="text-xs text-red-500 mt-1">{errors.currentPassword.message}</p>}
      </div>
      <div>
        <Label htmlFor="newPassword">Nova senha</Label>
        <Input id="newPassword" type="password" placeholder="Mínimo 8 caracteres" className={`mt-1 ${errors.newPassword ? 'border-red-500' : ''}`} {...register('newPassword')} />
        {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>}
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
        <Input id="confirmPassword" type="password" className={`mt-1 ${errors.confirmPassword ? 'border-red-500' : ''}`} {...register('confirmPassword')} />
        {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Alterar senha'}
      </Button>
    </form>
  )
}
