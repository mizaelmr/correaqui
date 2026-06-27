import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
})

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Autenticação necessária.' }, { status: 401 })
    }

    const body = await req.json()

    if (body.type === 'password') {
      const parsed = passwordSchema.safeParse(body)
      if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })

      const user = await prisma.user.findUnique({ where: { id: session.user.id } })
      if (!user?.password) return NextResponse.json({ error: 'Sem senha definida' }, { status: 400 })

      const isValid = await bcrypt.compare(parsed.data.currentPassword, user.password)
      if (!isValid) return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 400 })

      const hashed = await bcrypt.hash(parsed.data.newPassword, 12)
      await prisma.user.update({ where: { id: session.user.id }, data: { password: hashed } })
      return NextResponse.json({ ok: true })
    }

    const parsed = profileSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: parsed.data,
      select: { id: true, name: true, email: true, phone: true, image: true },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
