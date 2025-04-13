<script lang="ts" setup>
  import type { FormSubmitEvent } from "@nuxt/ui"
  import { z } from "zod"

  const schema = z
    .object({
      name: z.string().min(3, "Name must be at least 3 characters"),
      email: z.string().email("Invalid email format"),
      password: z.string().min(3, "Password must be at least 6 characters"),
      password_confirmation: z.string(),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: "Passwords do not match",
    })

  type Schema = z.infer<typeof schema>

  const state = reactive({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  })

  const registerMutation = useRegisterUser()

  async function onSubmit(event: FormSubmitEvent<Schema>) {
    await registerMutation.mutateAsync(event.data)
  }
  definePageMeta({
    layout: "auth",
  })
</script>

<template>
  <UContainer class="flex flex-col justify-center items-center h-screen">
    <h1 class="text-2xl font-bold">Register</h1>
    <UForm
      class="flex flex-col space-y-4 items-center"
      @submit="onSubmit"
      :schema="schema"
      :state="state"
    >
      <UFormField label="Name" name="name">
        <UInput v-model="state.name" class="w-[400px]" />
      </UFormField>
      <UFormField label="Email" name="email">
        <UInput v-model="state.email" class="w-[400px]" />
      </UFormField>
      <UFormField label="Password" name="password">
        <UInput v-model="state.password" type="password" class="w-[400px]" />
      </UFormField>
      <UFormField label="Password Confirmation" name="password_confirmation">
        <UInput
          v-model="state.password_confirmation"
          type="password"
          class="w-[400px]"
        />
      </UFormField>
      <ULink to="/login"> Already have an account? Login! </ULink>
      <UButton
        :loading="registerMutation.isPending.value"
        :disabled="registerMutation.isPending.value"
        type="submit"
      >
        Register
      </UButton>
    </UForm>
  </UContainer>
</template>
