import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { escapeHtml } from '@/lib/escapeHtml'
import { checkRateLimit, getClientIp, hashIp } from '@/lib/rateLimit'

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT ?? 465),
    secure: process.env.MAIL_ENCRYPTION === 'tls',
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    const { name, contact, message } = await req.json()

    if (typeof name !== 'string' || typeof contact !== 'string' || !name.trim() || !contact.trim()) {
      return NextResponse.json({ error: 'Nome e contato são obrigatórios.' }, { status: 400 })
    }
    if (name.length > 150 || contact.length > 150 || (message != null && (typeof message !== 'string' || message.length > 2000))) {
      return NextResponse.json({ error: 'Texto muito longo.' }, { status: 400 })
    }

    const allowed = await checkRateLimit(`ad:${hashIp(getClientIp(req))}`, 5, 60 * 60 * 1000)
    if (!allowed) {
      return NextResponse.json({ error: 'Muitas mensagens enviadas. Tente novamente mais tarde.' }, { status: 429 })
    }

    const safeName = escapeHtml(name.trim())
    const safeContact = escapeHtml(contact.trim())
    const safeMessage = message?.trim() ? escapeHtml(message.trim()).replace(/\n/g, '<br/>') : ''

    const from = `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`

    await createTransporter().sendMail({
      from,
      to: 'contato@tecvalle.com.br',
      subject: 'Interesse em anúncio — CORRE AQUI PREFEITO',
      html: `
        <h2>Novo interesse em anúncio</h2>
        <p><strong>Nome:</strong> ${safeName}</p>
        <p><strong>Contato (e-mail ou telefone):</strong> ${safeContact}</p>
        ${safeMessage ? `<p><strong>Mensagem:</strong><br/>${safeMessage}</p>` : ''}
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[ad-contact]', err)
    return NextResponse.json({ error: 'Erro ao enviar mensagem.' }, { status: 500 })
  }
}
