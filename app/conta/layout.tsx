import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MapPin, User, List, Settings, ChevronLeft } from 'lucide-react'
import { AccountSidebarNav } from '@/components/conta/AccountSidebarNav'

export default async function ContaLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">CorreAqui</span>
        </Link>
        <span className="text-gray-300 text-lg">/</span>
        <span className="text-sm text-gray-500">Minha Conta</span>
        <div className="ml-auto">
          <Link href="/" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ChevronLeft className="w-4 h-4" />
            Voltar ao mapa
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-8">
        <AccountSidebarNav user={session.user} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
