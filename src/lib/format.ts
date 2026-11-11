export function formatDate(value: string | Date | null | undefined) {
  if (!value)
    return ''
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : String(err)
}
