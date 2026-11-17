import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { isOwnMediaUrl } from '@/lib/media'
import { toPublicOccurrence } from '@/lib/publicOccurrence'
import { isStaffRole } from '@/lib/roles'

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

    const current = await prisma.occurrence.findUnique({ where: { id }, select: { status: true, userId: true } })
    if (!current) return NextResponse.json({ error: 'Ocorrência não encontrada.' }, { status: 404 })

    // Só quem registrou a ocorrência (logado) ou a prefeitura/admin pode informar a resolução
    const isStaff = isStaffRole(session.user.role)
    const isAuthor = !!current.userId && current.userId === session.user.id
    if (!isStaff && !isAuthor) {
      return NextResponse.json(
        { error: 'Só quem registrou a ocorrência ou a prefeitura pode informar a resolução.' },
        { status: 403 }
      )
    }

    if (current.status === 'RESOLVIDA') {
      return NextResponse.json({ error: 'Esta ocorrência já está resolvida.' }, { status: 409 })
    }
    if (!isStaff && current.status === 'AGUARDANDO_VALIDACAO') {
      return NextResponse.json({ error: 'Esta ocorrência já está aguardando validação.' }, { status: 409 })
    }

    const occurrence = await prisma.$transaction(async (tx) => {
      await tx.resolutionRequest.create({
        data: { occurrenceId: id, userId: session.user.id, comment, reporterName, reporterPhone, photos },
      })

      return tx.occurrence.update({
        where: { id },
        data: {
          // Prefeitura/admin já valida na hora; o autor manda para validação
          status: isStaff ? 'RESOLVIDA' : 'AGUARDANDO_VALIDACAO',
          photos: { create: photos.map((url) => ({ url, type: 'image' })) },
          timeline: {
            create: isStaff
              ? [
                  { type: 'FOTOS_ADICIONADAS', description: 'Novas fotos adicionadas como evidência.' },
                  { type: 'RESOLUCAO_APROVADA', description: 'Resolução confirmada pela prefeitura.' },
                  { type: 'STATUS_ALTERADO', description: 'Status alterado para: Resolvida.' },
                ]
              : [
                  { type: 'FOTOS_ADICIONADAS', description: 'Novas fotos adicionadas como evidência.' },
                  { type: 'RESOLUCAO_SOLICITADA', description: 'Quem registrou informou que o problema foi resolvido. Aguardando validação.' },
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
