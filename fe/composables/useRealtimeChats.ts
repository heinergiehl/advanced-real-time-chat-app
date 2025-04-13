type ChatCreatedPayload = {
  chat: Chat
  notification: Notification
}

export const useRealtimeChats = () => {
  const queryClient = useQueryClient()
  const { $socket: socket } = useNuxtApp()

  onMounted(() => {
    socket.on("chatCreated", (payload: ChatCreatedPayload) => {
      const { notification, chat } = payload

      queryClient.setQueryData<Notification[]>(
        ["notifications"],

        (oldData = []) => {
          return [notification, ...oldData]
        }
      )

      const chatWithNewNotifications = {
        ...chat,
        notifications: [notification],
      }
      queryClient.setQueryData<Chat[]>(["chats"], (oldData = []) => {
        return [...oldData, chatWithNewNotifications]
      })
    })
  })
  socket.on("chatDeleted", (payload: { chatId: number }) => {
    const { chatId } = payload

    queryClient.setQueryData<Chat[]>(["chats"], (oldData = []) => {
      return oldData.filter((chat) => chat.id !== chatId)
    })
    if (chatId === Number(useRoute().params.id)) {
      navigateTo("/")
    }
  })
  onBeforeUnmount(() => {
    socket.off("chatCreated")
    socket.off("chatDeleted")
  })
}
