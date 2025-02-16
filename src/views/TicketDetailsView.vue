<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useEventStore } from '../stores/events'
import AppLayout from '../components/layout/AppLayout.vue'
import QRCode from '../components/tickets/QRCode.vue'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import type { Booking } from '../stores/events'
import type { Event } from '../types/event'

const route = useRoute()
const eventStore = useEventStore()

const loading = ref(true)
const error = ref('')
const booking = ref<Booking | null>(null)
const event = ref<Event | null>(null)

const loadTicketDetails = async () => {
  try {
    loading.value = true
    error.value = ''

    const bookingId = route.params.id as string
    
    // Get booking directly from Firestore
    const bookingDoc = await getDoc(doc(db, 'bookings', bookingId))
    if (!bookingDoc.exists()) {
      error.value = 'Booking not found'
      return
    }

    booking.value = {
      id: bookingDoc.id,
      ...bookingDoc.data(),
      bookingDate: bookingDoc.data().bookingDate.toDate()
    } as Booking

    // Get event directly from Firestore
    const eventDoc = await getDoc(doc(db, 'events', booking.value.eventId))
    if (!eventDoc.exists()) {
      error.value = 'Event not found'
      return
    }

    event.value = {
      id: eventDoc.id,
      ...eventDoc.data()
    } as Event

  } catch (err: any) {
    console.error('Error loading ticket details:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTicketDetails()
})
</script>

<template>
  <AppLayout>
    <div class="container py-4">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <!-- Ticket Details -->
      <div v-else-if="booking && event" class="booking-confirmation-card bg-light rounded p-4 mb-3">
        <div class="text-center mb-4">
          <div class="qr-code-container bg-white rounded p-3 d-inline-block shadow-sm">
            <QRCode :booking-id="booking.id" />
          </div>
        </div>

        <div class="booking-details text-center">
          <h4 class="fw-bold mb-3">{{ event.title }}</h4>
          
          <div class="text-muted mb-3">
            <div class="mb-2">
              <i class="bi bi-calendar3 me-2"></i>
              {{ new Date(event.date).toLocaleDateString() }}
              <i class="bi bi-clock ms-3 me-2"></i>
              {{ event.time }}
            </div>
            <div>
              <i class="bi bi-geo-alt me-2"></i>
              {{ event.location }}
            </div>
          </div>

          <div class="ticket-info mb-4">
            <div class="d-inline-block mx-3">
              <div class="text-muted small">Tickets</div>
              <div class="fw-bold">{{ booking.quantity }}</div>
            </div>
            <div class="d-inline-block mx-3">
              <div class="text-muted small">Total Price</div>
              <div class="fw-bold">${{ booking.totalPrice.toFixed(2) }}</div>
            </div>
          </div>

          <div class="status-section">
            <span 
              class="badge"
              :class="{
                'bg-success': booking.status === 'Confirmed',
                'bg-warning': booking.status === 'Pending',
                'bg-danger': booking.status === 'Cancelled'
              }"
            >
              {{ booking.status }}
            </span>
            <div class="text-muted small mt-2">
              Booked on {{ new Date(booking.bookingDate).toLocaleDateString() }}
            </div>
          </div>
        </div>
      </div>

      <!-- Not Found State -->
      <div v-else class="text-center py-5">
        <div class="mb-3">
          <i class="bi bi-ticket-detailed display-1 text-muted"></i>
        </div>
        <h3>Ticket Not Found</h3>
        <p class="text-muted">The ticket you're looking for doesn't exist.</p>
        <router-link to="/" class="btn btn-primary">
          Go to Home
        </router-link>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.booking-confirmation-card {
  max-width: 600px;
  margin: 0 auto;
  background-color: #f8f9fa;
}

.qr-code-container {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  display: inline-block;
}

.ticket-info {
  background-color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.status-section {
  margin-top: 1.5rem;
}

.badge {
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
}
</style> 