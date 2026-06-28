'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 w-full transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Sair
    </button>
  )
}
