import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import type { Category, Severity, OccurrenceStatus } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') as Category | null
    const severity = searchParams.get('severity') as Severity | null
    const status = searchParams.get('status') as OccurrenceStatus | null
    const neighborhood = searchParams.get('neighborhood')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (category) where.category = category
    if (severity) where.severity = severity
    if (status) where.status = status
    if (neighborhood) where.neighborhood = { contains: neighborhood, mode: 'insensitive' }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { neighborhood: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const occurrences = await prisma.occurrence.findMany({
      where,
      include: {
        photos: true,
        timeline: true,
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(occurrences)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Autenticação necessária.' }, { status: 401 })
    }

    const body = await req.json()
    const {
      title, description, category, severity, latitude, longitude,
      address, neighborhood, city, state, reporterName, reporterPhone, showReporter, photos,
    } = body

    const occurrence = await prisma.occurrence.create({
      data: {
        title,
        description,
        category,
        severity,
        latitude,
        longitude,
        address,
        neighborhood,
        city,
        state,
        reporterName,
        reporterPhone,
        showReporter: showReporter ?? false,
        userId: session.user.id,
        photos: {
          create: (photos as string[]).map((url: string) => ({ url })),
        },
        timeline: {
          create: [{ type: 'CRIADA', description: 'Ocorrência registrada pela comunidade.' }],
        },
      },
      include: { photos: true, timeline: true },
    })

    return NextResponse.json(occurrence, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro ao criar ocorrência' }, { status: 500 })
  }
}
