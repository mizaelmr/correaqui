import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { isOwnMediaUrl } from '@/lib/media'
import { toPublicOccurrence } from '@/lib/publicOccurrence'

const schema = z.object({
  comment: z.string().trim().max(1000).optional(),
  reporterName: z.string().trim().max(150).optional(),
  reporterPhone: z.string().trim().max(30).optional(),
  photos: z.array(z.string().refine(isOwnMediaUrl, 'URL de mídia inválida')).min(1).max(5),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Entre na sua conta para informar a resolução.' }, { status: 401 })
    }

    const { id } = await params
    const parsed = schema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }
    const { comment, reporterName, reporterPhone, photos } = parsed.data

    const current = await prisma.occurrence.findUnique({ where: { id }, select: { status: true } })
    if (!current) return NextResponse.json({ error: 'Ocorrência não encontrada.' }, { status: 404 })
    if (current.status === 'RESOLVIDA' || current.status === 'AGUARDANDO_VALIDACAO') {
      return NextResponse.json({ error: 'Esta ocorrência já está resolvida ou aguardando validação.' }, { status: 409 })
    }

    const occurrence = await prisma.$transaction(async (tx) => {
      await tx.resolutionRequest.create({
        data: { occurrenceId: id, userId: session.user.id, comment, reporterName, reporterPhone, photos },
      })

      return tx.occurrence.update({
        where: { id },
        data: {
          status: 'AGUARDANDO_VALIDACAO',
          photos: { create: photos.map((url) => ({ url, type: 'image' })) },
          timeline: {
            create: [
              { type: 'FOTOS_ADICIONADAS', description: 'Novas fotos adicionadas como evidência.' },
              { type: 'RESOLUCAO_SOLICITADA', description: 'Cidadão informou que o problema foi resolvido. Aguardando validação.' },
              { type: 'STATUS_ALTERADO', description: 'Status alterado para: Aguardando Validação.' },
            ],
          },
        },
        include: { photos: true, timeline: true },
      })
    })

    return NextResponse.json(toPublicOccurrence(occurrence))
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro ao solicitar resolução' }, { status: 500 })
  }
}
