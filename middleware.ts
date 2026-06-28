import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import authConfig from './auth.config'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const role = (req.auth?.user as { role?: string } | undefined)?.role
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (role !== 'ADMIN' && role !== 'PREFEITURA') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  if (pathname.startsWith('/conta') && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if ((pathname === '/login' || pathname === '/cadastro') && isLoggedIn) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/conta/:path*', '/login', '/cadastro'],
}
