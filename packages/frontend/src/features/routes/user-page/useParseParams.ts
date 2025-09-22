export const useParseParams = (id: string | string[] | undefined): string | null => {
  if (id === undefined) return null
  if (Array.isArray(id)) return id[id.length - 1]
  return id
}