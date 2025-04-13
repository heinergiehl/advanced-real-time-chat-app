export function getAvatarUrl(user: User | undefined) {
  if (!user) return ""
  const config = useRuntimeConfig()
  const baseBackendUrl = config.public.BACKEND_BASE_URL
  if (user.profile_image) {
    return `${baseBackendUrl}/storage/${user.profile_image}`
  } else {
    return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${user?.name}`
  }
}
