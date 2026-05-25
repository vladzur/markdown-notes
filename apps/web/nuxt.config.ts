// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-05-24',

  ssr: true,

  routeRules: {
    '/': { redirect: '/folders' },
  },

  typescript: {
    strict: true,
    shim: false,
  },

  runtimeConfig: {
    public: {
      firebaseApiKey: process.env.NUXT_FIREBASE_API_KEY || '',
      firebaseAuthDomain: process.env.NUXT_FIREBASE_AUTH_DOMAIN || '',
      firebaseProjectId: process.env.NUXT_FIREBASE_PROJECT_ID || '',
      firebaseStorageBucket: process.env.NUXT_FIREBASE_STORAGE_BUCKET || '',
      firebaseMessagingSenderId: process.env.NUXT_FIREBASE_MESSAGING_SENDER_ID || '',
      firebaseAppId: process.env.NUXT_FIREBASE_APP_ID || '',
    },
  },

  modules: ['@nuxtjs/tailwindcss'],

  devtools: { enabled: true },
})
