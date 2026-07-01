import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const occurrence = await prisma.occurrence.findUnique({
      where: { id },
      include: { photos: true, timeline: true, user: { select: { id: true, name: true, image: true } } },
    })
    if (!occurrence) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    return NextResponse.json(occurrence)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { id } = await params
    const { description } = await req.json()

    if (!description?.trim()) return NextResponse.json({ error: 'Descrição obrigatória' }, { status: 400 })

    const occurrence = await prisma.occurrence.findUnique({ where: { id }, select: { userId: true } })
    if (!occurrence) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    if (occurrence.userId !== session.user.id) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const updated = await prisma.occurrence.update({
      where: { id },
      data: { description: description.trim() },
      include: { photos: true, timeline: true, user: { select: { id: true, name: true, image: true } } },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
