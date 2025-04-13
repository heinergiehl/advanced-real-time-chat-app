export const useGetChatWithMessages = (chatId: number) => {
  const { callApi } = useApi()

  return useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const reponse = await callApi<{ chat: Chat }>(`/chats/${chatId}`, {
        method: "GET",
        credentials: "include",
      })
      return reponse.chat
    },
  })
}
