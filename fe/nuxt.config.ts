// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: false },
  modules: ["@nuxt/ui", "@hebilicious/vue-query-nuxt", "@pinia/nuxt"],
  css: ["~/assets/css/main.css"],
  vueQuery: {
    // useState key used by nuxt for the vue query state.
    stateKey: "vue-query-nuxt", // default
    // If you only want to import some functions, specify them here.
    // You can pass false or an empty array to disable this feature.
    // default: ["useQuery", "useQueries", "useInfiniteQuery", "useMutation", "useIsFetching", "useIsMutating", "useQueryClient"]
    autoImports: [
      "useQuery",
      "useQueries",
      "useInfiniteQuery",
      "useMutation",
      "useIsFetching",
      "useIsMutating",
      "useQueryClient",
    ],
    // Pass the vue query client options here ...
    queryClientOptions: {
      defaultOptions: { queries: { staleTime: 5000 } }, // default
    },
    // Pass the vue query plugin options here ....
    vueQueryPluginOptions: {
      enableDevtoolsV6Plugin: true, // enable integrate with the official vue devtools
    },
  },
  runtimeConfig: {
    public: {
      API_BASE_URL: process.env.NUXT_PUBLIC_API_BASE_URL,
      BACKEND_BASE_URL: process.env.NUXT_PUBLIC_BACKEND_BASE_URL,
      GIPHY_API_URL: process.env.NUXT_PUBLIC_GIPHY_API_URL,
      GIPHY_API_KEY: process.env.NUXT_PUBLIC_GIPHY_API_KEY,
    },
  },
})
