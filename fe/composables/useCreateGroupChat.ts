type CreateGroupChatPayload = {
  friendIds: number[]
}

type CreateGroupChatResponse = {
  message: string
  chat: Chat
}

export const useCreateGroupChat = () => {
  const { callApi } = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateGroupChatPayload) => {
      return callApi<CreateGroupChatResponse>("/chats/group", {
        method: "POST",
        body: payload,
        credentials: "include",
      })
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] })
      queryClient.setQueryData(["chat", data.chat.id], data.chat)
    },
  })
}
