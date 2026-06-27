'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const schema = z
  .object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('E-mail inválido'),
    phone: z
      .string()
      .min(10, 'Telefone inválido')
      .regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Formato inválido'),
    password: z.string().min(8, 'Mínimo de 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export default function CadastroPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      }),
    })

    if (!res.ok) {
      const body = await res.json()
      toast.error(body.error || 'Erro ao criar conta.')
      return
    }

    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (result?.error) {
      toast.error('Conta criada! Faça login para continuar.')
      router.push('/login')
      return
    }

    toast.success('Conta criada com sucesso! Bem-vindo ao CorreAqui!')
    router.push('/')
    router.refresh()
  }

  const Field = ({
    id, label, error, children,
  }: { id: string; label: string; error?: string; children: React.ReactNode }) => (
    <div>
      <Label htmlFor={id} className="mb-1 block">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Criar conta</h1>
      <p className="text-sm text-gray-500 mb-6">Junte-se à comunidade CorreAqui</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field id="name" label="Nome completo" error={errors.name?.message}>
          <Input id="name" placeholder="João da Silva" className={errors.name ? 'border-red-500' : ''} {...register('name')} />
        </Field>

        <Field id="email" label="E-mail" error={errors.email?.message}>
          <Input id="email" type="email" placeholder="seu@email.com" className={errors.email ? 'border-red-500' : ''} {...register('email')} />
        </Field>

        <Field id="phone" label="Telefone celular" error={errors.phone?.message}>
          <Input id="phone" placeholder="(00) 00000-0000" className={errors.phone ? 'border-red-500' : ''} {...register('phone')} />
        </Field>

        <Field id="password" label="Senha" error={errors.password?.message}>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
              className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
              {...register('password')}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </Field>

        <Field id="confirmPassword" label="Confirmar senha" error={errors.confirmPassword?.message}>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Repita a senha"
            className={errors.confirmPassword ? 'border-red-500' : ''}
            {...register('confirmPassword')}
          />
        </Field>

        <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
          🔒 Suas informações são protegidas e nunca serão compartilhadas sem sua autorização.
        </p>

        <Button type="submit" className="w-full h-10" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar conta'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Já tem conta?{' '}
        <Link href="/login" className="text-blue-600 font-medium hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
