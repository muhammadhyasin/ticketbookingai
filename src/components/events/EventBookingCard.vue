<script setup lang="ts">
import { ref } from 'vue'
import { useEventStore } from '../../stores/events'
import { useAuthStore } from '../../stores/auth'
import type { Event } from '../../types/event'

const props = defineProps<{
  event: Event
}>()

const eventStore = useEventStore()
const authStore = useAuthStore()
const quantity = ref(1)
const loading = ref(false)
const error = ref('')
const success = ref(false)

const handleBooking = async () => {
  if (!authStore.isAuthenticated) {
    error.value = 'Please login to book tickets'
    return
  }

  try {
    loading.value = true
    error.value = ''
    success.value = false

    await eventStore.createBooking(
      props.event.id,
      authStore.user?.uid || '',
      quantity.value
    )

    success.value = true
    quantity.value = 1
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="card border-0 shadow-sm">
    <img :src="event.image" class="card-img-top" :alt="event.title" style="height: 200px; object-fit: cover;">
    <div class="card-body">
      <h5 class="card-title fw-bold mb-3">{{ event.title }}</h5>
      
      <div class="d-flex justify-content-between mb-3">
        <div class="text-muted">
          <i class="bi bi-calendar3 me-2"></i>
          {{ new Date(event.date).toLocaleDateString() }}
        </div>
        <div class="text-muted">
          <i class="bi bi-clock me-2"></i>
          {{ event.time }}
        </div>
      </div>

      <div class="mb-3">
        <div class="d-flex align-items-center mb-2">
          <i class="bi bi-geo-alt text-primary me-2"></i>
          <span>{{ event.location }}</span>
        </div>
        <div class="d-flex align-items-center">
          <i class="bi bi-ticket-perforated text-primary me-2"></i>
          <span>{{ event.availableTickets }} tickets available</span>
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center mb-3">
        <div class="fw-bold fs-4">${{ event.price }}</div>
        <span class="badge" :class="`bg-${event.status === 'Upcoming' ? 'success' : 'warning'}`">
          {{ event.status }}
        </span>
      </div>

      <div v-if="event.availableTickets > 0" class="booking-form">
        <div class="mb-3">
          <label class="form-label">Number of Tickets</label>
          <input
            type="number"
            class="form-control"
            v-model="quantity"
            min="1"
            :max="event.availableTickets"
            :disabled="loading"
          >
        </div>

        <div v-if="error" class="alert alert-danger">{{ error }}</div>
        <div v-if="success" class="alert alert-success">Booking confirmed!</div>

        <button
          @click="handleBooking"
          class="btn btn-primary w-100"
          :disabled="loading || quantity < 1 || quantity > event.availableTickets"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ loading ? 'Processing...' : `Book Now - $${(event.price * quantity).toFixed(2)}` }}
        </button>
      </div>
      <div v-else class="alert alert-warning">
        Sorry, this event is sold out!
      </div>
    </div>
  </div>
</template> 