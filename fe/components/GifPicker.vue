<script lang="ts" setup>
  const config = useRuntimeConfig()
  const apiKey = config.public.GIPHY_API_KEY
  const apiUrl = config.public.GIPHY_API_URL
  const searchTerm = ref("")
  const gifs = ref<any[]>([])

  async function fetchGifs() {
    const endpoint =
      searchTerm.value.trim() === ""
        ? "trending"
        : `search?q=${searchTerm.value}`
    const params = {
      api_key: apiKey,
      limit: 20,
      ...(endpoint === "search" && { q: searchTerm.value }),
    }
    const response = await $fetch(`${apiUrl}/${endpoint}`, { params })
    gifs.value = response.data
  }
  const emit = defineEmits<{ (e: "select", gifUrl: string): void }>()
  const selectGif = (gifUrl: string) => emit("select", gifUrl)
  fetchGifs()
</script>

<template>
  <UCard :ui="{ body: 'sm:p-2 p-2' }">
    <UInput
      class="w-full mb-4"
      palceholder="Search for gifs..."
      @keyup="fetchGifs"
      v-model="searchTerm"
      type="text"
    />

    <div
      class="grid-template grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2 overflow-y-auto h-[340px]"
    >
      <div v-for="gif in gifs" :key="gif.id" class="cursor-pointer">
        <img
          :src="gif.images.fixed_height.url"
          class="w-full h-auto"
          @click="selectGif(gif.images.fixed_height.url)"
        />
      </div>
    </div>
  </UCard>
</template>

<style></style>
