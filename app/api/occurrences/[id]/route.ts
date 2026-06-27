import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const occurrence = await prisma.occurrence.findUnique({
      where: { id },
      include: { photos: true, timeline: true },
    })
    if (!occurrence) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    return NextResponse.json(occurrence)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
