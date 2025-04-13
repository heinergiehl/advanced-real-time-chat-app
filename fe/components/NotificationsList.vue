<script lang="ts" setup>
  const { callApi } = useApi()
  const { data: notifications, isLoading } = useUseGetNotifications()

  const acceptFriendRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      callApi<{ message: string }>("/friend-request/accept", {
        method: "PUT",
        credentials: "include",
        body: { requestId },
      })
    },
  })
  const queryClient = useQueryClient()

  function acceptFriendRequest(requestId: number) {
    acceptFriendRequestMutation.mutate(requestId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] })
        queryClient.invalidateQueries({ queryKey: ["friends"] })
      },
    })
  }

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return await callApi<{ message: string }>(`/notifications/${id}/read`, {
        method: "PUT",
        credentials: "include",
      })
    },
  })

  async function markAsRead(entry: IntersectionObserverEntry) {
    const notificationId = Number(
      entry.target.getAttribute("data-notification-id")
    )
    const cachedNotifications = queryClient.getQueryData<Notification[]>([
      "notifications",
    ])
    if (!cachedNotifications) return
    const notification = cachedNotifications.find(
      (n) => n.id === notificationId
    )
    if (!notification || notification?.read) return

    markAsReadMutation.mutate(notificationId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] })
        queryClient.invalidateQueries({ queryKey: ["friends"] })
      },
    })
  }

  const { observeElement } = useIntersectionObserver(markAsRead)
  function registerNotificationRef(element: HTMLElement) {
    observeElement(element)
  }

  const { setActiveTabIndex } = useSideTabsStore()
</script>

<template>
  <div class="h-[calc(100vh-60px)] flex w-[200px]">
    <USeparator orientation="vertical" />
    <div class="flex w-full flex-col">
      <span v-if="isLoading" class="dark:text-gray-300 text-gray-500 text-xs"
        >Loading...</span
      >

      <span
        v-else-if="!notifications || notifications.length === 0"
        class="text-gray-500 text-xs p-2"
        >No notifications</span
      >
      <div v-else class="overflow-y-auto">
        <div
          :ref="(el)=>registerNotificationRef(el as HTMLElement)"
          v-for="notification in notifications"
          :key="notification.id"
          :data-notification-id="notification.id"
          class="mb-2"
        >
          <UCard
            @click="
              () => {
                const notType =
                  notification.type === 'CHAT_MESSAGE'
                    ? '0'
                    : notification.type === 'FRIEND_REQUEST' ||
                      notification.type === 'FRIEND_REQUEST_ACCEPTED'
                    ? '1'
                    : '0'
                setActiveTabIndex(notType)
              }
            "
            :ui="{
              root: 'p-2 ',
              header: 'p-0 sm:px-0',
              footer: 'p-1 ',
              body: 'sm:p-1',
            }"
            class="rounded-none"
            :class="
              !notification.read
                ? 'bg-blue-100/60 dark:bg-blue-800/60'
                : 'bg-gray-200/60 dark:bg-gray-700/60'
            "
          >
            <template #header>
              <span class="text-xs dark:text-gray-400 text-gray-700">{{
                new Date(notification.createdAt).toLocaleDateString()
              }}</span>

              <span class="text-xs dark:text-gray-400 text-gray-700 mx-1">{{
                "/"
              }}</span>

              <span class="text-xs dark:text-gray-400 text-gray-700">{{
                new Date(notification.createdAt).toLocaleTimeString()
              }}</span>
              <USeparator />
            </template>
            <ULink>
              <span
                v-if="
                  notification.type === 'FRIEND_REQUEST' ||
                  notification.type === 'FRIEND_REQUEST_ACCEPTED'
                "
              >
                <UAvatar
                  class="mr-2"
                  size="xs"
                  :src="getAvatarUrl(notification.friendRequest?.sender)"
                />
              </span>
              <span class="text-xs">
                {{ notification.message }}
              </span>
            </ULink>
            <template #footer>
              <div
                v-if="
                  notification.type === 'FRIEND_REQUEST' &&
                  notification.friendRequest &&
                  notification.friendRequestId
                "
              >
                <UButton
                  @click="acceptFriendRequest(notification.friendRequestId)"
                  v-if="notification.friendRequest.status === 'PENDING'"
                  >Accept</UButton
                >
              </div>
            </template>
          </UCard>
        </div>
      </div>
    </div>
    <USeparator orientation="vertical" />
  </div>
</template>
