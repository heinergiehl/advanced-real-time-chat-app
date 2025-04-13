import type { RouteRecordNameGeneric } from "vue-router"

export interface UserResponse {
  message: string
  user: User
}

export const useUserProfile = (routeName: RouteRecordNameGeneric) => {
  const { callApi } = useApi()

  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      return await callApi<UserResponse>("/profile", {
        method: "GET",
        credentials: "include",
      })
    },
    enabled: routeName !== "login" && routeName !== "register",
    retry: 1,
  })
}
