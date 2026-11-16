type WithReporter = {
  showReporter: boolean
  reporterName?: string | null
  reporterPhone?: string | null
  user?: unknown
}

/**
 * Remove dados pessoais antes de devolver a ocorrência para o público:
 * telefone/nome do relator nunca saem, e o usuário só aparece se ele optou por exibir o nome.
 */
export function toPublicOccurrence<T extends WithReporter>(o: T) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { reporterName, reporterPhone, user, ...rest } = o
  return { ...rest, user: o.showReporter ? user ?? null : null }
}
