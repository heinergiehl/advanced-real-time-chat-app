export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export const useRegisterUser = () => {
  const { callApi } = useApi()
  const toast = useToast()

  return useMutation({
    mutationFn: async (variables: RegisterPayload) => {
      return await callApi<{ message: string }>("/register", {
        method: "POST",
        body: variables,
        credentials: "include",
      })
    },
    onError: (error: any) => {
      toast.add({
        title: "Error",
        description: error.response._data.message,
        color: "error",
        icon: "i-heroicons-information-circle",
      })
    },
    onSuccess: () => navigateTo("/"),
  })
}
