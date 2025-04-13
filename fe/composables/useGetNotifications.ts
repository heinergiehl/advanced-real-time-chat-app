export const useUseGetNotifications = () => {
  const { callApi } = useApi()

  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      return await callApi<Notification[]>("/notifications", {
        method: "GET",
        credentials: "include",
      })
    },
  })
}
