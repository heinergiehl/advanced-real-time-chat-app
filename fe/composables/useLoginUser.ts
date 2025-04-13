export interface LoginPayload {
  email: string
  password: string
}

export const useUseLoginUser = () => {
  const { callApi } = useApi()
  const toast = useToast()

  return useMutation({
    mutationFn: async (variables: LoginPayload) => {
      await callApi<{ meesage: string }>("/login", {
        method: "POST",
        body: variables,
        credentials: "include",
      })
    },
    onError: (error: any) => {
      console.log(error.response, error.response._data)
      toast.add({
        title: "Error",
        description: error.response._data.message,
        color: "error",
        icon: "i-heroicons-information-circle",
      })
    },
    onSuccess: async () => {
      navigateTo("/")
    },
  })
}
