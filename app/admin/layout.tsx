import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MapPin, LayoutDashboard, List, LogOut } from 'lucide-react'
import { SignOutButton } from '@/components/admin/SignOutButton'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session || (role !== 'ADMIN' && role !== 'PREFEITURA')) redirect('/')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-14 flex items-center gap-2 px-4 border-b border-gray-200">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">Painel Gestor</span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            href="/admin/ocorrencias"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <List className="w-4 h-4" />
            Ocorrências
          </Link>
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-1">
          <Link href="/" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors">
            <MapPin className="w-4 h-4" />
            Ver mapa
          </Link>
          <SignOutButton />
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-3">
          <span className="text-sm text-gray-500">Olá, <span className="font-medium text-gray-900">{session.user.name}</span></span>
          <span className="ml-auto text-xs bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded-full">{role}</span>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
