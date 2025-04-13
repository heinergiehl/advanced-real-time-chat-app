<template>
  <UContainer class="">
    <Navigation />
    <div class="flex w-full dark:bg-gray-950">
      <SideTabs />
      <div class="flex-1">
        <slot />
      </div>
      <LobbySidebar />
    </div>
  </UContainer>
</template>
lt

<script lang="ts" setup>
  const socket = useNuxtApp().$socket
  const presenceStore = usePresenceStore()
  useUseRealtimeFriendRequest()
  useRealtimeFriends()
  useRealtimeChats()
  useRealtimeChatMessages()
  onMounted(() => {
    if (!socket.connected) {
      socket.connect()
    }
    socket.emit("joinLobby")
    presenceStore.initializePresence()
  })
  const params = useRoute().params
  onBeforeUnmount(() => {
    if (params.id) {
      socket.emit(
        "leaveChat",
        {
          chatId: params.id,
        },
        () => {
          socket.disconnect()
        }
      )
    }

    socket.emit("leaveLobby", {}, () => {
      socket.disconnect()
    })
    presenceStore.cleanPresence()
  })
</script>

<style></style>
