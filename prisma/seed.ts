import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  await prisma.occurrence.deleteMany()

  const occurrences = [
    {
      title: 'Buraco na Rua das Flores',
      description: 'Grande buraco no meio da via, prejudicando o trânsito de veículos e pedestres. Já causou um acidente com moto.',
      category: 'BURACO' as const,
      severity: 'ALTA' as const,
      latitude: -15.7801,
      longitude: -47.9292,
      address: 'Rua das Flores, 123, Centro, Brasília - DF',
      neighborhood: 'Centro',
      city: 'Brasília',
      state: 'DF',
      confirmations: 14,
    },
    {
      title: 'Lixo acumulado na Av. Principal',
      description: 'Acúmulo de lixo doméstico em frente ao parque. Mau cheiro e risco de doenças.',
      category: 'LIXO_ACUMULADO' as const,
      severity: 'MEDIA' as const,
      latitude: -15.7750,
      longitude: -47.9350,
      address: 'Av. Principal, 500, Asa Norte, Brasília - DF',
      neighborhood: 'Asa Norte',
      city: 'Brasília',
      state: 'DF',
      confirmations: 7,
    },
    {
      title: 'Iluminação pública apagada',
      description: 'Três postes com a iluminação apagada há mais de 15 dias. Trecho escuro e perigoso à noite.',
      category: 'ILUMINACAO_PUBLICA' as const,
      severity: 'MEDIA' as const,
      latitude: -15.7820,
      longitude: -47.9200,
      address: 'Rua B, Quadra 12, Asa Sul, Brasília - DF',
      neighborhood: 'Asa Sul',
      city: 'Brasília',
      state: 'DF',
      confirmations: 22,
    },
    {
      title: 'Rua alagada após chuva',
      description: 'Sempre que chove a rua fica completamente alagada. Água entra nas casas e lojas.',
      category: 'RUA_ALAGADA' as const,
      severity: 'CRITICA' as const,
      latitude: -15.7870,
      longitude: -47.9300,
      address: 'Rua C, 45, Taguatinga, Brasília - DF',
      neighborhood: 'Taguatinga',
      city: 'Brasília',
      state: 'DF',
      confirmations: 31,
    },
    {
      title: 'Vazamento de água na calçada',
      description: 'Água jorrando da rua há 3 dias. Desperdício enorme e risco de desabamento.',
      category: 'VAZAMENTO_AGUA' as const,
      severity: 'ALTA' as const,
      latitude: -15.7760,
      longitude: -47.9400,
      address: 'Rua D, 88, Ceilândia, Brasília - DF',
      neighborhood: 'Ceilândia',
      city: 'Brasília',
      state: 'DF',
      confirmations: 5,
    },
    {
      title: 'Árvore caída bloqueando pista',
      description: 'Árvore de grande porte caiu após a tempestade e está bloqueando metade da pista.',
      category: 'ARVORE_CAIDA' as const,
      severity: 'CRITICA' as const,
      latitude: -15.7730,
      longitude: -47.9250,
      address: 'Av. das Árvores, 200, Lago Sul, Brasília - DF',
      neighborhood: 'Lago Sul',
      city: 'Brasília',
      state: 'DF',
      confirmations: 18,
    },
  ]

  for (const data of occurrences) {
    await prisma.occurrence.create({
      data: {
        ...data,
        photos: {
          create: [],
        },
        timeline: {
          create: [
            { type: 'CRIADA', description: 'Ocorrência registrada pela comunidade.' },
          ],
        },
      },
    })
  }

  console.log(`Seed completed: ${occurrences.length} occurrences created.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
