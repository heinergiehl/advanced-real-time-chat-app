export const useChatsList = () => {
  const { callApi } = useApi()

  const query = useQuery<Chat[]>({
    queryKey: ["chats"],
    queryFn: async () => {
      return await callApi<Chat[]>("/chats", {
        method: "GET",
        credentials: "include",
      })
    },
  })
  const chatsArray = computed(() => query.data.value || [])

  return {
    chats: chatsArray,
    isLoading: query.isLoading,
    refetch: query.refetch,
    error: query.error,
  }
}
