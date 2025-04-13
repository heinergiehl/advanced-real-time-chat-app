export interface UpdateProfilePayload {
  name: string
  profileFile?: File
}

export const useUpdateProfile = () => {
  const { callApi } = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const formData = new FormData()
      formData.append("name", payload.name)
      if (payload.profileFile) {
        formData.append("profileFile", payload.profileFile)
      }

      await callApi<{ message: string }>("/profile", {
        method: "PUT",
        body: formData,
        credentials: "include",
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] })
    },
  })
}
