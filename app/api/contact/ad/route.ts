import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

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

    if (!name?.trim() || !contact?.trim()) {
      return NextResponse.json({ error: 'Nome e contato são obrigatórios.' }, { status: 400 })
    }

    const from = `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`

    await createTransporter().sendMail({
      from,
      to: 'contato@tecvalle.com.br',
      subject: 'Interesse em anúncio — CORRE AQUI PREFEITO',
      html: `
        <h2>Novo interesse em anúncio</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Contato (e-mail ou telefone):</strong> ${contact}</p>
        ${message ? `<p><strong>Mensagem:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>` : ''}
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[ad-contact]', err)
    return NextResponse.json({ error: 'Erro ao enviar mensagem.' }, { status: 500 })
  }
}
