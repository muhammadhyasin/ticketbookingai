<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useEventStore } from '../../stores/events'
import { useAuthStore } from '../../stores/auth'
import { Event } from '../../types/event'

const eventStore = useEventStore()
const authStore = useAuthStore()

onMounted(async () => {
  if (authStore.user?.uid) {
    await eventStore.loadUserBookings(authStore.user.uid)
  }
})

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="card border-0 shadow-sm">
    <div class="card-body p-4">
      <h4 class="mb-4">Your Bookings</h4>
      
      <div v-if="eventStore.loading" class="text-center py-4">
        <div class="spinner-border text-primary"></div>
      </div>
      
      <div v-else-if="eventStore.bookings.length === 0" class="text-center py-4">
        <i class="bi bi-ticket-detailed display-1 text-muted mb-3 d-block"></i>
        <p class="lead">No bookings found</p>
        <router-link to="/" class="btn btn-primary">
          Book an Event
        </router-link>
      </div>
      
      <div v-else class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Date Booked</th>
              <th>Tickets</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="booking in eventStore.bookings" :key="booking.id">
              <td>
                <router-link 
                  :to="`/tickets/${booking.id}`"
                  class="text-decoration-none"
                >
                  {{ eventStore.events.find((e: Event) => e.id === booking.eventId)?.title }}
                </router-link>
              </td>
              <td>{{ formatDate(booking.bookingDate) }}</td>
              <td>{{ booking.quantity }}</td>
              <td>${{ booking.totalPrice.toFixed(2) }}</td>
              <td>
                <span 
                  class="badge"
                  :class="`bg-${booking.status === 'Confirmed' ? 'success' : 'warning'}`"
                >
                  {{ booking.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template> 