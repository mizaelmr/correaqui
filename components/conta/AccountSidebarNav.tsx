'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, List, Settings, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/conta/perfil', label: 'Meu Perfil', icon: User },
  { href: '/conta/ocorrencias', label: 'Minhas Ocorrências', icon: List },
  { href: '/conta/configuracoes', label: 'Configurações', icon: Settings },
]

interface AccountSidebarNavProps {
  user: { name?: string | null; email?: string | null; image?: string | null }
}

export function AccountSidebarNav({ user }: AccountSidebarNavProps) {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm mb-2">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <p className="font-medium text-sm text-gray-900 truncate">{user.name}</p>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
        </div>

        <nav className="p-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                pathname === href
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-2 border-t border-gray-100">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </div>
    </aside>
  )
}
