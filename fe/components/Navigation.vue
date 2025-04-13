<script lang="ts" setup>
  const colorMode = useColorMode()
  const routeName = useRoute().name
  const userProfileQuery = useUserProfile(routeName)
  const logoutMutation = useLogoutUser()
  const socket = useNuxtApp().$socket

  const isDark = computed({
    get() {
      return colorMode.value === "dark"
    },
    set() {
      colorMode.preference = colorMode.value === "dark" ? "light" : "dark"
    },
  })

  const links = computed(() => {
    const baseLinks = [
      {
        label: "Home",
        icon: "i-heroicons-chat-bubble-left-ellipsis",
        to: "/",
      },
      {
        slot: "darkMode",
      },
    ]

    const authUser = userProfileQuery.data.value?.user
    const authLinks = authUser
      ? [
          {
            label: authUser.name,
            avatar: {
              src: getAvatarUrl(authUser),
            },
            to: "/profile",
          },
          {
            label: "Logout",
            slot: "logout",
            onSelect: async () => {
              await logoutMutation.mutateAsync()
              navigateTo("/login")
            },
          },
        ]
      : [
          {
            label: "Login",
            icon: "i-heroicons-arrow-left-start-on-rectangle",
            to: "/login",
          },
        ]

    return [baseLinks, authLinks]
  })
</script>

<template>
  <UNavigationMenu
    :items="links"
    class="border-b border-gray-200 dark:border-gray-800"
  >
    <template #darkMode-label>
      <UButton
        :icon="
          isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'
        "
        class="p-0"
        variant="link"
        @click="isDark = !isDark"
      >
      </UButton>
    </template>
  </UNavigationMenu>
</template>
