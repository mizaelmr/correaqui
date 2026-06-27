import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Autenticação necessária.' }, { status: 401 })
    }

    const { id } = await params
    const userId = session.user.id

    const existing = await prisma.confirmation.findUnique({
      where: { occurrenceId_userId: { occurrenceId: id, userId } },
    })

    if (existing) {
      return NextResponse.json({ error: 'Você já confirmou esta ocorrência.' }, { status: 409 })
    }

    const occurrence = await prisma.$transaction(async (tx) => {
      await tx.confirmation.create({ data: { occurrenceId: id, userId } })

      return tx.occurrence.update({
        where: { id },
        data: {
          confirmations: { increment: 1 },
          timeline: {
            create: { type: 'CONFIRMADA', description: 'A comunidade confirmou esta ocorrência.' },
          },
        },
        include: { photos: true, timeline: true },
      })
    })

    return NextResponse.json(occurrence)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro ao confirmar' }, { status: 500 })
  }
}
