'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LogOut, Trash2 } from 'lucide-react'

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-500">Gerencie suas preferências</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Sessão</h2>
        <Button
          variant="outline"
          className="flex items-center gap-2 text-red-500 border-red-200 hover:bg-red-50"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="w-4 h-4" />
          Sair da conta
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-red-100 p-6">
        <h2 className="font-semibold text-red-700 mb-2">Zona de perigo</h2>
        <p className="text-sm text-gray-500 mb-4">
          A exclusão de conta é permanente e removerá todos os seus dados.
        </p>
        <Button
          variant="outline"
          disabled
          className="flex items-center gap-2 text-red-500 border-red-200 opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          Excluir conta (em breve)
        </Button>
      </div>
    </div>
  )
}
