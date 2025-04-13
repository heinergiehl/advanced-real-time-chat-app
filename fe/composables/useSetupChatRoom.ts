import type { RouteRecordNameGeneric } from "vue-router"

export interface TypingIndicator {
  name: string
  userId: number
  isTyping: boolean
}

export const useSetupChatRoom = (
  chatId: number,
  routeName: RouteRecordNameGeneric
) => {
  const typingIndicators = ref<TypingIndicator[]>([])
  const { $socket: socket } = useNuxtApp()

  const joinChat = () => {
    socket.emit("joinChat", { chatId })
  }
  const leaveChat = () => {
    socket.emit(
      "leaveChat",
      { chatId },
      (ack: { success: boolean; message?: string }) => {
        if (ack.success) {
          console.log("Leave chat acknowledged:", ack.message, routeName)
          if (routeName === "login" || routeName === "register") {
            socket.disconnect()
          }
        } else {
          console.error("Leave chat failed:", ack.message)
        }
      }
    )
  }

  const currentOnlineUsersInChat = ref<MinimalUser[]>([])

  const onTypingIndicator = (payload: TypingIndicator) => {
    console.log("Typing indicator received: ", payload)
    const idx = typingIndicators.value.findIndex(
      (ti) => ti.userId === payload.userId
    )
    if (payload.isTyping) {
      if (idx === -1) {
        typingIndicators.value.push(payload)
      } else {
        typingIndicators.value[idx] = payload
      }
    } else {
      if (idx !== -1) {
        typingIndicators.value.splice(idx, 1)
      }
    }
  }

  const toast = useToast()
  const queryClient = useQueryClient()
  const onUserJoined = (payload: {
    userId: number
    name: string
    profile_image: string
  }) => {
    const friends = queryClient.getQueryData<Friend[]>(["friends"])
    const friend = friends?.find((f) => f.id === payload.userId)
    if (!friend) return
    toast.add({
      description: `${payload.name} joined the chat`,
      title: "User joined",
      avatar: {
        src: getAvatarUrl(friend),
        alt: payload.name,
      },
      color: "success",
      duration: 1000,
    })
  }

  const onUserLeft = (payload: {
    userId: number
    name: string
    profile_image: string
  }) => {
    console.log("User left: ", payload)

    const friends = queryClient.getQueryData<Friend[]>(["friends"])
    const friend = friends?.find((friend: User) => friend.id === payload.userId)
    if (!friend) return
    toast.add({
      title: "User left",
      avatar: {
        src: getAvatarUrl(friend),

        alt: payload.name,
      },
      color: "error",
      description: `${payload.name} left the chat`,
      duration: 800,
    })
  }
  onMounted(() => {
    socket.on("userLeft", onUserLeft)
    joinChat()
    socket.on("typingIndicator", onTypingIndicator)
    socket.on("userJoined", onUserJoined)
  })

  onBeforeUnmount(() => {
    leaveChat()
    socket.off("typingIndicator", onTypingIndicator)
    socket.off("userJoined", onUserJoined)
    socket.off("userLeft", onUserLeft)
  })

  const emitTyping = (isTyping: boolean) => {
    socket.emit("typing", { chatId, isTyping })
  }
  return { typingIndicators, emitTyping, currentOnlineUsersInChat }
}
