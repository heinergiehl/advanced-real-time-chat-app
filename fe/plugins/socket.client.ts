import { io } from "socket.io-client"

export default defineNuxtPlugin((nuxtApp) => {
  const config = nuxtApp.$config
  const backendUrl = config.public.BACKEND_BASE_URL

  const socket = io(backendUrl, {
    withCredentials: true,
    autoConnect: false,
  })

  return {
    provide: {
      socket,
    },
  }
})
