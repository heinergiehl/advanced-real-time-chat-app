<script lang="ts" setup>
  import { z } from "zod"
  import type { FormSubmitEvent } from "#ui/types"
  const schema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
  })
  type Schema = z.infer<typeof schema>
  const route = useRoute()
  const routeName = route.name
  const userProfileData = useUserProfile(routeName)
  const user = userProfileData.data.value?.user
  const userRef = ref(user?.name)
  const state = reactive({
    name: userRef.value,
  })
  const profileFile = ref<File | null>(null)

  function onFileChange(event: Event) {
    const files = (event.target as HTMLInputElement).files

    if (files) {
      profileFile.value = files[0]
    }
  }
  const updateUserProfileMutation = useUpdateProfile()
  const existingProfileImage = ref<string | null>(null)
  watch(
    () => userProfileData.data.value,
    (newProfileData) => {
      if (newProfileData) {
        existingProfileImage.value = newProfileData.user?.profile_image || null
        state.name = newProfileData.user?.name || ""
      }
    }
  )

  async function onSubmit(event: FormSubmitEvent<Schema>) {
    await updateUserProfileMutation.mutateAsync({
      ...event.data,
      profileFile: profileFile.value || undefined,
    })
  }
</script>

<template>
  <UContainer
    class="h-[calc(100vh-60px)] flex flex-col justify-center items-center w-[550px]"
  >
    <h1 class="text-2xl font-bold my-6">Profile Settings</h1>

    <UForm
      class="space-y-4 flex flex-col items-start"
      :schema="schema"
      :state="state"
      @submit="onSubmit"
    >
      <UFormField label="Name" name="name">
        <UInput v-model="state.name" />
      </UFormField>
      <UFormField label="Profile Image" name="profile_image">
        <UInput
          type="file"
          @change="onFileChange"
          :existingFile="existingProfileImage"
        />
      </UFormField>
      <UButton
        class="w-[60px]"
        :loading="updateUserProfileMutation.isPending.value"
        :disabled="updateUserProfileMutation.isPending.value"
        type="submit"
      >
        Save
      </UButton>
    </UForm>
  </UContainer>
</template>
