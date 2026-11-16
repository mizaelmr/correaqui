import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { toPublicOccurrence } from '@/lib/publicOccurrence'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Entre na sua conta para confirmar.' }, { status: 401 })
    }

    const { id } = await params
    const userId = session.user.id

    const target = await prisma.occurrence.findUnique({ where: { id }, select: { userId: true } })
    if (!target) return NextResponse.json({ error: 'Ocorrência não encontrada.' }, { status: 404 })
    if (target.userId === userId) {
      return NextResponse.json({ error: 'Você não pode confirmar sua própria ocorrência.' }, { status: 400 })
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

    return NextResponse.json(toPublicOccurrence(occurrence))
  } catch (err) {
    // Violação do @@unique([occurrenceId, userId]) — já confirmou (inclusive cliques duplos simultâneos)
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ error: 'Você já confirmou esta ocorrência.' }, { status: 409 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Erro ao confirmar' }, { status: 500 })
  }
}
