import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Autenticação necessária.' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { comment, reporterName, reporterPhone, photos } = body

    await prisma.resolutionRequest.create({
      data: {
        occurrenceId: id,
        userId: session.user.id,
        comment,
        reporterName,
        reporterPhone,
        photos: photos ?? [],
      },
    })

    const occurrence = await prisma.occurrence.update({
      where: { id },
      data: {
        status: 'AGUARDANDO_VALIDACAO',
        photos: {
          create: (photos as string[]).map((url: string) => ({ url })),
        },
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

    return NextResponse.json(occurrence)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro ao solicitar resolução' }, { status: 500 })
  }
}
