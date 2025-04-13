<script lang="ts" setup>
  import "vue3-emoji-picker/css"
  import EmojiPicker from "vue3-emoji-picker"
  const route = useRoute()
  const routeName = useRoute().name
  const chatId = ref(Number(route.params.id))
  const userProfileQuery = useUserProfile(routeName)
  const chatQuery = useGetChatWithMessages(chatId.value)
  const { typingIndicators, emitTyping } = useSetupChatRoom(
    chatId.value,
    routeName
  )
  const otherTypingIndicators = computed(() => {
    return typingIndicators.value.filter(
      (ti) => ti.userId !== userProfileQuery.data?.value?.user?.id
    )
  })
  const message = ref("")
  interface Attachment {
    mediaUrl: string
    type: "GIF" | "IMAGE"
  }
  const attachments = ref<Attachment[]>([])
  function removeAttachment(index: number) {
    attachments.value.splice(index, 1)
  }
  const { mutateAsync } = useSendMessage()
  const chatContainer = ref<HTMLElement | null>(null)
  function scrollToBottom() {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  }

  async function sendMessage() {
    if (!message.value.trim() && attachments.value.length === 0) return
    emitTyping(false)
    const payload = {
      chatId: chatId.value,
      content: message.value,
      attachments: attachments.value,
    }
    await mutateAsync(payload)
    message.value = ""
    attachments.value = []
    await nextTick()
    scrollToBottom()
  }

  function OnInput() {
    emitTyping(true)
  }

  function onBlur() {
    emitTyping(false)
  }
  const showEmojiPicker = ref(false)
  function toggleEmojiPicker() {
    showEmojiPicker.value = !showEmojiPicker.value
  }
  function onSelectEmoji(emoji: any) {
    message.value += emoji.i
    showEmojiPicker.value = false
  }
  const showGifPicker = ref(false)

  function toggleGifPicker() {
    showGifPicker.value = !showGifPicker.value
  }

  function onSelectGif(gifUrl: string) {
    attachments.value.push({ mediaUrl: gifUrl, type: "GIF" })
    showGifPicker.value = false
  }

  const imageInput = ref<HTMLInputElement | null>(null)
  function triggerImageInput() {
    if (imageInput.value) {
      imageInput.value.click()
    }
  }
  const { callApi } = useApi()
  async function onImageSelected(event: Event) {
    const target = event.target as HTMLInputElement
    if (!target.files) return
    const files = Array.from(target.files)
    for (const file of files) {
      const formData = new FormData()
      formData.append("file", file)
      const data = await callApi<{ storedFilename: string }>("/chats/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      })
      attachments.value.push({ mediaUrl: data.storedFilename, type: "IMAGE" })
    }
    target.value = ""
  }

  watch(
    () => chatQuery.data.value?.messages,
    () => {
      nextTick(() => scrollToBottom())
    },
    { immediate: true, deep: true }
  )
  onMounted(() => {
    scrollToBottom()
  })

  onUpdated(() => {
    scrollToBottom()
  })
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return await callApi<{ message: string }>(`/notifications/${id}/read`, {
        method: "PUT",
        credentials: "include",
      })
    },
  })
  const queryClient = useQueryClient()
  async function markAsRead(entry: IntersectionObserverEntry) {
    const msgId = Number(entry.target.getAttribute("data-msg-id"))
    if (!msgId) return
    const msg = chatQuery.data.value?.messages?.find((m) => m.id === msgId)
    if (!msg) return
    const notification = msg.notifications?.find(
      (n) => n.userId === userProfileQuery.data.value?.user?.id
    )
    if (!notification || notification.read) return
    markAsReadMutation.mutate(notification.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] })
        queryClient.invalidateQueries({ queryKey: ["chats"] })
      },
    })
  }

  const { observeElement } = useIntersectionObserver(markAsRead)
  function registerMsgRef(element: HTMLElement) {
    observeElement(element)
  }

  const colorMode = useColorMode()
  const isLoading = chatQuery.isLoading
  const error = chatQuery.error
  const chat = chatQuery.data
  const backendBaseUrl = useRuntimeConfig().public.BACKEND_BASE_URL

  const presenceStore = usePresenceStore()
  const onlineUsersInChat = computed(() => presenceStore.chatUsers)
  const isOnline = (userId: number | undefined) => {
    if (!onlineUsersInChat) return false
    return onlineUsersInChat
      .value(chatId.value)
      .some((user) => user.id === userId)
  }
</script>

<template>
  <div class="flex h-full w-full">
    <div class="flex flex-col relative flex-1">
      <span v-if="isLoading" class="p-4 h-[90px] text-gray-400"
        >Loading...</span
      >
      <span v-else-if="error" class="p-4 h-[90px] text-gray-400">Error...</span>

      <div v-else>
        <div class="flex flex-col py-4 h-[90px]">
          <span class="text-lg font-bold text-center">Chat {{ chat?.id }}</span>
          <USeparator />
          <div
            class="flex flex-wrap items-center justify-center text-gray-500 text-sm my-2"
          >
            <span class="mr-1 md:block hidden"
              >with the following participants:</span
            >

            <UAvatarGroup
              v-for="participant in chat?.participants?.filter(
                (p) => p.user?.id !== userProfileQuery.data.value?.user?.id
              )"
              :key="participant.id"
            >
              <UChip
                inset
                :color="isOnline(participant.user?.id) ? 'success' : 'neutral'"
              >
                <UTooltip v-if="participant.user" :text="participant.user.name">
                  <UAvatar
                    :name="participant.user?.name"
                    :src="getAvatarUrl(participant.user)"
                  />
                </UTooltip>
              </UChip>
            </UAvatarGroup>
          </div>
          <USeparator />
        </div>

        <!-- chat container -->
        <div
          class="p-4 overflow-y-auto space-y-4 flex flex-col"
          :class="
            attachments.length === 0
              ? 'h-[67vh] md:h-[70vh]'
              : 'h-[56vh] md:h-[61vh]'
          "
          ref="chatContainer"
        >
          <div
            :class="
              message.senderId === userProfileQuery.data.value?.user?.id
                ? 'self-end bg-blue-100/60 dark:bg-blue-800/60'
                : 'self-start bg-gray-200/60 dark:bg-gray-700/60'
            "
            class="max-w-xs rounded-lg shadow-md p-2"
            v-for="message in chat?.messages"
            :key="message.id"
            :data-msg-id="message.id"
            :ref="(el) => registerMsgRef(el as HTMLElement)"
          >
            <div
              class="text-xs italic"
              :class="
                message.senderId === userProfileQuery.data.value?.user?.id
                  ? 'text-gray-200'
                  : 'text-gray-400'
              "
            >
              {{ message?.sender?.name }} says:
            </div>
            <p class="break-words">{{ message.content }}</p>

            <div v-if="message.media && message.media.length" class="mt-2">
              <div
                v-for="attachment in message.media"
                :key="attachment.id"
                class="my-2"
              >
                <img
                  v-if="attachment.type === 'GIF'"
                  :src="attachment.mediaUrl"
                  @load="scrollToBottom"
                  class="w-[100px] md:w-[150px] h-auto rounded-lg"
                />
                <img
                  v-else-if="attachment.type === 'IMAGE'"
                  :src="`
                ${backendBaseUrl}/storage/chatMedia/${attachment.mediaUrl}
                  `"
                  @load="scrollToBottom"
                  class="w-[100px] md:w-[150px] h-auto rounded-lg"
                />
              </div>
            </div>
            <span class="text-xs text-gray-300 mt-1">
              {{ new Date(message.createdAt).toLocaleString() }}</span
            >
          </div>
        </div>
        <!-- end of chat container -->
        <!-- typing indicator -->
        <UCard
          :ui="{ body: 'sm:p-1 p-1' }"
          v-if="otherTypingIndicators.length"
          class="z-10 text-sm text-gray-500 italic absolute bottom-[16%] md:bottom-[10%] left-[50%] translate-x-[-50%]"
        >
          <span v-for="(ti, index) in otherTypingIndicators" :key="index">
            {{ ti.name }} is typing...
          </span>
        </UCard>
        <!-- end of typing indicator -->
        <!-- input area -->
        <div class="relative flex-shrink-0 p-4 bg-gray-100 dark:bg-gray-800">
          <div
            class="flex flex-col md:flex-row md:items-center space-y-2 md:sapce-y-0 md:space-x-2"
          >
            <UInput
              v-model="message"
              @input="OnInput"
              @blur="onBlur"
              placeholder="Type a message..."
              class="flex-grow w-full max-w-full"
            />

            <div class="flex justify-between space-x-2">
              <!-- Action Buttons -->
              <div class="flex space-x-2">
                <UButton @click="toggleEmojiPicker" variant="ghost" class="p-1">
                  <UIcon name="i-heroicons-face-smile" size="20" />
                </UButton>
                <UButton @click="toggleGifPicker" variant="ghost" class="p-1">
                  <UIcon name="i-heroicons-gif" size="20" />
                </UButton>
                <UButton @click="triggerImageInput" variant="ghost" class="p-1">
                  <UIcon name="i-heroicons-photo" size="20" />
                </UButton>
              </div>
              <!-- end of Action Buttons -->
              <!-- Send Button -->
              <UButton
                color="primary"
                @click="sendMessage"
                class="whitespace-nowrap"
              >
                Send
              </UButton>
              <!-- end of  Send Button -->
            </div>
          </div>
          <!-- Attachment Previews -->
          <div
            class="mt-4 overflow-x-auto flex space-x-4 flex-wrap sapce-y-1 overflow-y-auto h-[50px]"
            v-if="attachments.length"
          >
            <div
              v-for="(attachment, index) in attachments"
              :key="index"
              class="relative"
            >
              <img
                v-if="attachment.type === 'IMAGE'"
                class="w-16 h-16 object-cover rounded-md"
                :src="`${backendBaseUrl}/storage/chatMedia/${attachment.mediaUrl}`"
                @load="scrollToBottom"
              />

              <img
                v-else-if="attachment.type === 'GIF'"
                class="w-16 h-16 rounded-md"
                :src="attachment.mediaUrl"
                alt="Attachment gif"
                @load="scrollToBottom"
              />

              <UButton
                class="absolute top-1 right-1 text-xs p-1 w-4 h-4"
                @click="removeAttachment(index)"
                color="error"
              >
                x
              </UButton>
            </div>
          </div>
          <!-- Hidden Image File Input -->
          <input
            type="file"
            ref="imageInput"
            accept="image/*"
            multiple
            class="hidden"
            @change="onImageSelected"
          />
          <div v-if="showEmojiPicker" class="absolute bottom-full right-0 z-20">
            <EmojiPicker
              :native="true"
              @select="onSelectEmoji"
              :theme="colorMode.value === 'dark' ? 'dark' : 'light'"
            />
          </div>

          <div v-if="showGifPicker" class="absolute bottom-full right-0 z-20">
            <GifPicker @select="onSelectGif" />
          </div>

          <!-- end of Attachment Previews -->
        </div>
        <!-- end of input area -->
      </div>
    </div>
  </div>
</template>
