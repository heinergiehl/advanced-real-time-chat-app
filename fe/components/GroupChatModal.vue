<script lang="ts" setup>
  type FriendOption = {
    value: number
    label: string
  }
  const props = defineProps<{
    open: boolean
    friendOptions: FriendOption[]
    preSelectedFriends?: number[]
  }>()

  const emit = defineEmits<{ (e: "update:open", value: boolean): void }>()
  const internalOpen = ref(props.open)

  watch(
    () => props.open,
    (newValue) => {
      internalOpen.value = newValue
    }
  )
  watch(internalOpen, (newValue) => {
    emit("update:open", newValue)
  })

  const selectedFriendIds = ref<number[]>([])

  watch(
    () => props.preSelectedFriends,
    (newVal) => {
      if (newVal) {
        selectedFriendIds.value = newVal
          .map(
            (id) => props.friendOptions.find((option) => option.value === id)!
          )
          .map((option) => option.value)
      }
    }
  )
  const { mutateAsync, isPending, error } = useCreateGroupChat()

  async function onCreateGroupChat() {
    const payload = {
      friendIds: selectedFriendIds.value,
    }
    await mutateAsync(payload)
    internalOpen.value = false
  }
</script>

<template>
  <UModal v-model:open="internalOpen" title="Create Group Chat">
    <template #body>
      <UFormField label="Select friends" name="friends">
        <USelect
          multiple
          v-model="selectedFriendIds"
          :items="friendOptions"
          placeholder="Select friends"
        />
      </UFormField>

      <div v-if="error" class="text-red-500">{{ error.message }}</div>
    </template>
    <template #footer>
      <UButton
        @click="onCreateGroupChat"
        :loading="isPending"
        :disabled="isPending"
        >Create</UButton
      >
    </template>
  </UModal>
</template>
