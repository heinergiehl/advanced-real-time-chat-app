import { defineStore } from "pinia"

export const usePresenceStore = defineStore("presence", {
  state: () => ({
    onlineUsers: [] as User[],
    initialized: false,
  }),
  getters: {
    lobbyUsers: (state) => state.onlineUsers.filter((user) => !user.chatId),
    chatUsers: (state) => (chatId: number) =>
      state.onlineUsers.filter((user) => user.chatId === chatId),
  },
  actions: {
    initializePresence() {
      if (this.initialized) return
      if (import.meta.server) return
      const nuxtApp = useNuxtApp()
      const socket = nuxtApp.$socket
      const queryClient = useQueryClient()
      socket.on("presenceUpdate", (onlineUsers: User[]) => {
        this.onlineUsers = onlineUsers
        queryClient.invalidateQueries({ queryKey: ["friends"] })
      })
      this.initialized = true
    },
    cleanPresence() {
      if (import.meta.server) return
      const nuxtApp = useNuxtApp()
      const socket = nuxtApp.$socket
      socket?.off("presenceUpdate")
      this.initialized = false
      this.onlineUsers = []
    },
  },
})
