import type { NextAuthConfig } from 'next-auth'

export default {
  providers: [],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
} satisfies NextAuthConfig
