import { MapPin } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 shadow">
          <MapPin className="w-6 h-6 text-white" />
        </div>
        <span className="font-bold text-2xl text-gray-900">CorreAqui</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-8 text-xs text-gray-400">Sua cidade, sua voz.</p>
    </div>
  )
}
