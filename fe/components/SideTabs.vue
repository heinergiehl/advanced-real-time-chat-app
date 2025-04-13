<script lang="ts" setup>
  const items = computed(() => [
    {
      label: "Chats",
      icon: "i-heroicons-chat-bubble-bottom-center-text",
      slot: "chats",
      unread: unreadChatsCount.value,
    },
    {
      label: "Friends",
      icon: "i-heroicons-user-group",
      slot: "friends",
      unread: unreadFriendsCount.value,
    },
    {
      label: "Notifications",
      icon: "i-heroicons-bell",
      slot: "notifications",
      unread: unreadNotificationsCount.value,
    },
  ])

  const { callApi } = useApi()
  const { data: notifications, isLoading } = useUseGetNotifications()

  const unreadChatsCount = computed(() =>
    notifications.value && notifications.value.length
      ? notifications.value.filter((n) => !n.read && n.type === "CHAT_CREATED")
          .length
      : 0
  )

  const unreadFriendsCount = computed(() =>
    notifications.value && notifications.value.length
      ? notifications.value.filter(
          (n) => !n.read && n.type === "FRIEND_REQUEST_ACCEPTED"
        ).length
      : 0
  )

  const unreadNotificationsCount = computed(() =>
    notifications.value && notifications.value.length
      ? notifications.value.filter((n) => !n.read).length
      : 0
  )

  const store = useSideTabsStore()
</script>

<template>
  <UTabs
    v-model="store.activeTabIndex"
    :ui="{
      label: 'hidden md:block',
      root: 'gap-0',
      list: 'h-[calc(100vh-60px)] rounded-none py-6 bg-gray-200 dark:bg-gray-900',
    }"
    :unmount-on-hide="true"
    variant="link"
    orientation="vertical"
    :items="items"
  >
    <template #leading="{ item }">
      <div>
        <span
          class="text-gray-600 dark:text-gray-400 rounded-full"
          v-if="item.unread === 0"
        >
          <UIcon :name="item.icon" size="22" />
        </span>
        <UChip v-else :text="item.unread" size="xl" inset>
          <UIcon :name="item.icon" size="22" />
        </UChip>
      </div>
    </template>
    <template #chats>
      <ChatsList />
    </template>

    <template #friends>
      <FriendsList />
    </template>

    <template #notifications>
      <NotificationsList />
    </template>
  </UTabs>
</template>
