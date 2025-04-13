export const useDeleteChat = () => {
  const queryClient = useQueryClient()
  const { callApi } = useApi()

  return useMutation({
    mutationFn: async (chatId: number) => {
      await callApi<{ message: string }>(`/chats/${chatId}`, {
        method: "DELETE",
        credentials: "include",
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] })
    },
  })
}
