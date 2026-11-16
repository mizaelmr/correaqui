import { createHash } from 'crypto'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

/** IP do cliente (na Vercel vem no x-forwarded-for). */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

/** Hash do IP para não guardar o IP em texto puro no banco. */
export function hashIp(ip: string): string {
  const salt = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? 'correaqui'
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32)
}

/**
 * Registra uma tentativa e informa se o limite foi estourado.
 * Retorna true quando a requisição pode seguir.
 */
export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const since = new Date(Date.now() - windowMs)
  const count = await prisma.rateLimit.count({ where: { key, createdAt: { gte: since } } })
  if (count >= limit) return false

  await prisma.rateLimit.create({ data: { key } })

  // Limpeza ocasional de registros antigos (mais de 1 dia)
  if (Math.random() < 0.02) {
    prisma.rateLimit
      .deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } })
      .catch(() => {})
  }
  return true
}
