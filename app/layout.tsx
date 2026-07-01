import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CORRE AQUI PREFEITO — Sua cidade, sua voz.',
  description:
    'Plataforma colaborativa para registro e acompanhamento de problemas de infraestrutura urbana.',
  keywords: 'infraestrutura urbana, buracos, ocorrências, cidade, prefeitura, cidadão',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${inter.className} h-full overflow-hidden`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
