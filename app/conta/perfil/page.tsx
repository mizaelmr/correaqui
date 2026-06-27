import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ProfileForm } from '@/components/conta/ProfileForm'
import { PasswordForm } from '@/components/conta/PasswordForm'

export default async function PerfilPage() {
  const session = await auth()
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { id: true, name: true, email: true, phone: true, image: true },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-sm text-gray-500">Gerencie suas informações pessoais</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Foto de perfil</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">{user?.name}</p>
            <button className="text-xs text-blue-600 hover:underline mt-0.5">
              Alterar foto (em breve)
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Informações pessoais</h2>
        <ProfileForm user={user!} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Alterar senha</h2>
        <PasswordForm />
      </div>
    </div>
  )
}
