<script lang="ts" setup>
  import type { FormSubmitEvent } from "@nuxt/ui"
  import { z } from "zod"

  const schema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(3, "Password must be at least 6 characters"),
  })

  type Schema = z.infer<typeof schema>

  const state = reactive({
    email: "",
    password: "",
  })

  const loginMutation = useUseLoginUser()

  async function onSubmit(event: FormSubmitEvent<Schema>) {
    await loginMutation.mutateAsync(event.data)
  }
  definePageMeta({
    layout: "auth",
  })
</script>

<template>
  <UContainer class="flex flex-col justify-center items-center h-screen">
    <h1 class="text-2xl font-bold">Login</h1>
    <UForm
      class="flex flex-col space-y-4 items-center"
      @submit="onSubmit"
      :schema="schema"
      :state="state"
    >
      <UFormField label="Email" name="email">
        <UInput v-model="state.email" class="w-[400px]" />
      </UFormField>
      <UFormField label="Password" name="password">
        <UInput v-model="state.password" type="password" class="w-[400px]" />
      </UFormField>

      <ULink to="/register"> Not registered? Register! </ULink>
      <UButton
        :loading="loginMutation.isPending.value"
        :disabled="loginMutation.isPending.value"
        type="submit"
      >
        Login
      </UButton>
    </UForm>
  </UContainer>
</template>
