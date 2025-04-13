export const useApi = () => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.API_BASE_URL

  const callApi = async <T>(
    endpoint: string,
    options: Parameters<typeof $fetch>[1] = {}
  ): Promise<T> => {
    return await $fetch<T>(`${baseUrl}${endpoint}`, options)
  }

  return { callApi }
}
