import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  token: z.string(),
  password: z.string().min(8),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const { token, password } = parsed.data

    const reset = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!reset || reset.used || reset.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Token inválido ou expirado.' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: reset.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { token },
        data: { used: true },
      }),
    ])

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
