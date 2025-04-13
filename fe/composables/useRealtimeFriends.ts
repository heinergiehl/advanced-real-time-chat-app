export const useRealtimeFriends = () => {
  const queryClient = useQueryClient()
  const { $socket: socket } = useNuxtApp()

  onMounted(() => {
    socket.on("newFriendAdded", (payload: any) => {
      queryClient.invalidateQueries({ queryKey: ["friends"] })
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    })
  })
  onBeforeUnmount(() => {
    socket.off("newFriendAdded")
  })
}
