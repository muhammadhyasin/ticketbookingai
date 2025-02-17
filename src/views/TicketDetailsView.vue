<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventStore } from '../stores/events'
import AppLayout from '../components/layout/AppLayout.vue'
import type { Booking } from '../stores/events'

const route = useRoute()
const router = useRouter()
const eventStore = useEventStore()
const loading = ref(true)
const error = ref('')
const booking = ref<Booking | null>(null)

// Fetch booking by ID instead of user ID
const fetchBooking = async () => {
  try {
    loading.value = true
    error.value = ''
    const bookingId = route.params.id as string
    const result = await eventStore.getBookingById(bookingId)
    if (!result) {
      error.value = 'Ticket not found'
      return
    }
    booking.value = result
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchBooking)

const event = computed(() => {
  if (!booking.value) return null
  return eventStore.events.find(e => e.id === booking.value?.eventId) || null
})

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const qrCodeUrl = computed(() => {
  if (typeof window !== 'undefined') {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${window.location.href}`
  }
  return ''
})
</script>

<template>
  <AppLayout>
    <div class="container py-4">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <!-- Ticket Details -->
      <div v-else-if="booking && event" class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <div class="text-center mb-4">
            <h2 class="h4 mb-0">Event Ticket</h2>
            <p class="text-muted">Booking ID: {{ booking.id }}</p>
          </div>

          <div class="ticket-details">
            <h3 class="h5 mb-4">{{ event.title }}</h3>
            
            <div class="row mb-3">
              <div class="col-md-6">
                <p class="mb-1"><strong>Date:</strong></p>
                <p class="text-muted">{{ formatDate(new Date(event.date)) }}</p>
              </div>
              <div class="col-md-6">
                <p class="mb-1"><strong>Time:</strong></p>
                <p class="text-muted">{{ event.time }}</p>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-6">
                <p class="mb-1"><strong>Location:</strong></p>
                <p class="text-muted">{{ event.location }}</p>
              </div>
              <div class="col-md-6">
                <p class="mb-1"><strong>Quantity:</strong></p>
                <p class="text-muted">{{ booking.quantity }} ticket(s)</p>
              </div>
            </div>

            <div v-if="booking.includeGuide" class="alert alert-info">
              <i class="bi bi-info-circle me-2"></i>
              Tour guide service included
            </div>

            <div class="qr-code text-center mt-4">
              <img :src="qrCodeUrl" 
                   alt="Ticket QR Code"
                   class="img-fluid">
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.ticket-details {
  max-width: 600px;
  margin: 0 auto;
}

.qr-code img {
  max-width: 200px;
  border: 1px solid #dee2e6;
  padding: 1rem;
  border-radius: 0.5rem;
}
</style> 