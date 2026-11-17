/** Perfis que validam e fecham ocorrências (prefeitura e administração). */
export function isStaffRole(role: string | null | undefined): boolean {
  return role === 'ADMIN' || role === 'PREFEITURA'
}
