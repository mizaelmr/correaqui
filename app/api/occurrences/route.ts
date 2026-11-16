import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { isOwnMediaUrl } from '@/lib/media'
import { checkRateLimit, getClientIp, hashIp } from '@/lib/rateLimit'
import { toPublicOccurrence } from '@/lib/publicOccurrence'
import type { Category, Severity, OccurrenceStatus } from '@/types'

const CATEGORIES = [
  'BURACO', 'RUA_ALAGADA', 'LIXO_ACUMULADO', 'ILUMINACAO_PUBLICA', 'VAZAMENTO_AGUA',
  'ESGOTO', 'ARVORE_CAIDA', 'OBRA_ABANDONADA', 'FALTA_PAVIMENTACAO', 'OUTRO',
] as const
const SEVERITIES = ['BAIXA', 'MEDIA', 'ALTA', 'CRITICA'] as const

const createSchema = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10).max(2000),
  category: z.enum(CATEGORIES),
  severity: z.enum(SEVERITIES),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().trim().min(1).max(300),
  neighborhood: z.string().max(150).optional(),
  city: z.string().max(150).optional(),
  state: z.string().max(100).optional(),
  showReporter: z.boolean().optional(),
  photos: z
    .array(z.object({ url: z.string().refine(isOwnMediaUrl, 'URL de mídia inválida'), type: z.enum(['image', 'video']) }))
    .min(1)
    .max(5),
  // Honeypot: campo invisível no formulário. Pessoas não preenchem; robôs sim.
  website: z.string().optional(),
})

// Limites para publicações anônimas (por IP)
const ANON_LIMIT_PER_HOUR = 5
const ANON_LIMIT_PER_DAY = 15

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

    return NextResponse.json(occurrences.map(toPublicOccurrence))
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id ?? null

    const parsed = createSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 })
    }
    const data = parsed.data

    // Honeypot preenchido: finge sucesso sem gravar nada
    if (data.website) {
      return NextResponse.json({ ok: true }, { status: 201 })
    }

    if (!userId) {
      const ipKey = hashIp(getClientIp(req))
      const okHour = await checkRateLimit(`occ:h:${ipKey}`, ANON_LIMIT_PER_HOUR, 60 * 60 * 1000)
      const okDay = okHour && (await checkRateLimit(`occ:d:${ipKey}`, ANON_LIMIT_PER_DAY, 24 * 60 * 60 * 1000))
      if (!okHour || !okDay) {
        return NextResponse.json(
          { error: 'Muitas ocorrências enviadas. Tente novamente mais tarde ou entre na sua conta.' },
          { status: 429 }
        )
      }
    }

    const occurrence = await prisma.occurrence.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        severity: data.severity,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        // Anônimo não tem nome para exibir
        showReporter: userId ? data.showReporter ?? false : false,
        userId,
        photos: { create: data.photos.map(({ url, type }) => ({ url, type })) },
        timeline: {
          create: [{ type: 'CRIADA', description: 'Ocorrência registrada pela comunidade.' }],
        },
      },
      include: { photos: true, timeline: true },
    })

    return NextResponse.json(toPublicOccurrence(occurrence), { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro ao criar ocorrência' }, { status: 500 })
  }
}
