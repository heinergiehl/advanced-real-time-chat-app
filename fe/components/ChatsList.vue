<script lang="ts" setup>
  const chatsQuery = useChatsList()
  const chats = chatsQuery.chats
  const deleteMutation = useDeleteChat()
  const deletingChatId = ref<number | null>(null)
  const activeChatId = ref<number | null>(null)
  const toast = useToast()

  function deleteChat(chatId: number) {
    deletingChatId.value = chatId
    deleteMutation.mutateAsync(chatId, {
      onSuccess: () => {
        if (chatId === activeChatId.value) {
          navigateTo("/")
        }
        deletingChatId.value = null
        activeChatId.value = null
        toast.add({
          color: "success",
          title: "Success",
          description: "Chat deleted successfully",
          icon: "i-heroicons-information-circle",
        })
      },
    })
  }
  const routeName = useRoute().name
  const userProfileQuery = useUserProfile(routeName)
  const userProfile = userProfileQuery.data?.value?.user

  const getButtonClasses = computed(() => (chat: Chat) => {
    if (chat.id === activeChatId.value) {
      return ["bg-green-200", "dark:bg-green-950"]
    }
    const userId = userProfile?.id

    const notifications = Array.isArray(chat.notifications)
      ? chat.notifications
      : []

    const hasUnread = notifications.some((n) => n?.userId === userId && !n.read)

    return hasUnread
      ? ["bg-blue-100/60", "dark:bg-blue-800/60"]
      : ["bg-gray-200/60", "dark:bg-gray-700/60"]
  })

  const { callApi } = useApi()
  const queryClient = useQueryClient()
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return await callApi<{ message: string }>(`/notifications/${id}/read`, {
        method: "PUT",
        credentials: "include",
      })
    },
  })
  async function markAsRead(entry: IntersectionObserverEntry) {
    const chatId = Number(entry.target.getAttribute("data-chat-id"))
    if (!chatId) return
    const cachedChats = queryClient.getQueryData<Chat[]>(["chats"])
    const cachedChat = cachedChats?.find((c) => c.id === chatId)
    if (!cachedChat) return
    if (!cachedChat.notifications) return
    const cachedNotification = cachedChat.notifications.find(
      (n) => n.type === "CHAT_CREATED" && n.userId === userProfile?.id
    )
    if (!cachedNotification || cachedNotification.read) return

    markAsReadMutation.mutate(cachedNotification.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] })
        queryClient.invalidateQueries({ queryKey: ["chats"] })
      },
    })
  }
  const { observeElement } = useIntersectionObserver(markAsRead)
  function registerEl(el: Element | null) {
    observeElement(el as HTMLElement | null)
  }

  const setActiveChatId = (chatId: number) => {
    activeChatId.value = chatId
  }
</script>

<template>
  <div class="h-[calc(100vh-60px)] w-[200px] flex">
    <USeparator orientation="vertical" />
    <div class="flex flex-col w-full">
      <span v-if="chatsQuery.isLoading.value" class="text-xs text-gray-500"
        >Loading...</span
      >
      <span
        v-else-if="!Array.isArray(chats) || !chats.length"
        class="text-xs text-gray-500 p-2"
        >No chats available</span
      >
      <div v-else class="overflow-y-auto">
        <div
          class="mb-2 overflow-y-auto"
          :ref="(el) => registerEl(el as HTMLElement)"
          v-for="chat in chats"
          :key="chat.id"
          :data-chat-id="chat.id"
        >
          <UButton
            @click="setActiveChatId(chat.id)"
            :class="getButtonClasses(chat)"
            variant="ghost"
            :to="`/chats/${chat.id}`"
            class="flex flex-col rounded-none px-1"
          >
            <div class="flex w-full justify-between items-center">
              <div>
                <span
                  class="dark:text-gray-400 text-gray-700 text-xs font-thin"
                  >{{ new Date(chat.createdAt).toLocaleDateString() }}</span
                >
                <span
                  class="dark:text-gray-400 text-gray-700 text-xs font-thin mx-1"
                  >-</span
                >
                <span
                  class="dark:text-gray-400 text-gray-700 text-xs font-thin"
                  >{{ new Date(chat.createdAt).toLocaleTimeString() }}</span
                >
              </div>
              <UButton
                @click="deleteChat(chat.id)"
                :disabled="deletingChatId === chat.id"
                :loading="deletingChatId === chat.id"
                variant="ghost"
                color="error"
                class="rounded-full p-1 cursor-pointer"
              >
                <UIcon
                  v-if="deletingChatId !== chat.id"
                  name="i-heroicons-trash"
                  color="gray"
                />
              </UButton>
            </div>
            <USeparator orientation="horizontal" />
            <!-- one to chat -->
            <div
              class="flex items-center justify-between w-full"
              v-if="chat.type === 'ONE_ON_ONE' && chat.participants?.[1].user"
            >
              <UAvatar
                class="mr-2"
                size="md"
                :src="getAvatarUrl(chat.participants[1].user)"
                :alt="chat.participants[1].user?.name || ''"
              />

              <div class="flex">
                <span class="text-gray-500 text-xs mr-2">From</span>
                <span class="text-xs w-[100px] truncate">{{
                  chat.participants[1].user.name
                }}</span>
              </div>
            </div>

            <!-- end of one to chat -->
            <!-- group chat -->
            <div v-else class="flex items-center w-full">
              <span class="text-gray-500 text-xs mr-2">With</span>
              <UAvatarGroup :max="3" size="md">
                <UTooltip
                  v-for="participant in chat.participants"
                  :key="participant.id"
                  :text="participant.user?.name || ''"
                >
                  <UAvatar
                    :src="getAvatarUrl(participant?.user)"
                    :alt="participant.user?.name || ''"
                  />
                </UTooltip>
              </UAvatarGroup>
            </div>
            <!-- end of group chat -->

            <USeparator />
            <div class="flex items-center w-full">
              <div
                v-if="chat.lastMessage?.content"
                class="dark:text-gray-400 text-gray-700 font-thin text-xs space-x-1 flex-col flex"
              >
                <span
                  class="dark:text-gray-400 text-gray-700 text-xs font-thin"
                >
                  Last Message by {{ chat.lastMessage?.sender?.name }}</span
                >
                <span>{{ chat.lastMessage?.content }}</span>
              </div>
              <span
                v-else-if="
                  chat.lastMessage?.media && chat.lastMessage.media.length
                "
                class="dark:text-gray-400 text-gray-700 text-xs font-thin"
              >
                Last Message: {{ chat.lastMessage?.sender?.name }} sent
                Media</span
              >
              <span
                v-else
                class="dark:text-gray-400 text-gray-700 text-xs font-thin"
              >
                Nobody has written anything yet</span
              >
            </div>
          </UButton>
        </div>
      </div>
    </div>
    <USeparator orientation="vertical" />
  </div>
</template>

<style></style>
