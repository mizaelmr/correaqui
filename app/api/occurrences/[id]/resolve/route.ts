import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { comment, reporterName, reporterPhone, photos } = body

    await prisma.resolutionRequest.create({
      data: { occurrenceId: id, comment, reporterName, reporterPhone, photos: photos ?? [] },
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
