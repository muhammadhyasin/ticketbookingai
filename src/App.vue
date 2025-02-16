<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { auth } from './config/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { user, loading } = storeToRefs(authStore)

onMounted(() => {
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    authStore.setUser(firebaseUser)
  })

  // Cleanup subscription on unmount
  return () => unsubscribe()
})
</script>

<template>
  <div v-if="loading" class="min-vh-100 d-flex align-items-center justify-content-center">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
  <router-view v-else />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
