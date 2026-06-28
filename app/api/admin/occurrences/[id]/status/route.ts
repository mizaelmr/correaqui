import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session || (role !== 'ADMIN' && role !== 'PREFEITURA')) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { id } = await params
  const { status } = await req.json()

  const validStatuses = ['ABERTA', 'EM_ANALISE', 'AGUARDANDO_VALIDACAO', 'RESOLVIDA']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
  }

  const occurrence = await prisma.occurrence.update({
    where: { id },
    data: {
      status,
      timeline: {
        create: {
          type: 'STATUS_ALTERADO',
          description: `Status alterado para ${status.replace(/_/g, ' ')} pelo gestor.`,
        },
      },
    },
  })

  return NextResponse.json(occurrence)
}
