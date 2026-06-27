import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const occurrence = await prisma.occurrence.update({
      where: { id },
      data: {
        confirmations: { increment: 1 },
        timeline: {
          create: { type: 'CONFIRMADA', description: 'A comunidade confirmou esta ocorrência.' },
        },
      },
      include: { photos: true, timeline: true },
    })

    return NextResponse.json(occurrence)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro ao confirmar' }, { status: 500 })
  }
}
