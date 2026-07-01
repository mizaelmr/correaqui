import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'E-mail obrigatório' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })

    // Retorna sucesso mesmo se o usuário não existir (segurança)
    if (!user) return NextResponse.json({ ok: true })

    const token = randomUUID()
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1 hora

    await prisma.passwordReset.create({
      data: { token, userId: user.id, expiresAt },
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/redefinir-senha?token=${token}`

    // Em produção: enviar e-mail com resetUrl via nodemailer
    // Por ora, logamos para desenvolvimento
    console.log(`[CORRE AQUI PREFEITO] Link de redefinição para ${email}: ${resetUrl}`)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
