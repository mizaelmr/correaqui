import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { LoginForm } from './LoginForm'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>}>
      <LoginForm />
    </Suspense>
  )
}
