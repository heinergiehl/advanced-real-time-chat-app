type OneToOneChatPayload = {
  friendId: number
}
type OneToOneChatResponse = {
  message: string
  chat: Chat
}
export const useCreateOneToOneChat = () => {
  const { callApi } = useApi()

  return useMutation({
    mutationFn: async (payload: OneToOneChatPayload) => {
      const { friendId } = payload

      return await callApi<OneToOneChatResponse>("/chats/one-to-one", {
        method: "POST",
        body: { friendId },
        credentials: "include",
      })
    },
  })
}
