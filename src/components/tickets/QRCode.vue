<script setup lang="ts">
import { computed } from 'vue'
import QRCodeVue from 'qrcode.vue'

const props = defineProps<{
  bookingId: string
}>()

const qrValue = computed(() => {
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin
  return `${baseUrl}/tickets/${props.bookingId}`
})
</script>

<template>
  <QRCodeVue :value="qrValue" :size="200" level="H" />
</template> 