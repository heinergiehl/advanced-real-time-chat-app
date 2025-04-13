interface SendMessagePayload {
  chatId: number
  content: string
}

interface SendMessageResponse {
  message: ChatMessage
  success: boolean
}

export const useSendMessage = () => {
  const { callApi } = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: SendMessagePayload) => {
      return await callApi<SendMessageResponse>(
        `/chats/${payload.chatId}/messages`,
        {
          method: "POST",
          body: payload,
          credentials: "include",
        }
      )
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] })
      queryClient.invalidateQueries({
        queryKey: ["chat", variables.chatId],
      })
    },
    onError: (error) => {
      console.log(error)
    },
  })
}
