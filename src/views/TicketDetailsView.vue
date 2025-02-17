<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../components/layout/AppLayout.vue'
import { useEventStore } from '../stores/events'
import { useAuthStore } from '../stores/auth'
import type { Event } from '../types/event'
import QRCode from 'qrcode.vue'

const route = useRoute()
const router = useRouter()
const eventStore = useEventStore()
const authStore = useAuthStore()
const loading = ref(true)

// First find the booking
const booking = computed(() => {
  const bookingId = route.params.id as string
  return eventStore.bookings.find(b => b.id === bookingId)
})

// Then find the event based on the booking
const event = computed(() => {
  if (!booking.value) return null
  return eventStore.events.find(e => e.id === booking.value.eventId) || null
})

// Check if user has booked this event
const hasBooked = computed(() => {
  if (!booking.value || !authStore.user) return false
  return booking.value.userId === authStore.user.uid && 
         booking.value.status === 'Confirmed'
})

// Add QR code value computed property
const qrValue = computed(() => {
  if (!booking.value) return ''
  const baseUrl = window.location.origin
  return `${baseUrl}/tickets/${booking.value.id}`
})

// Watch for auth state changes
watch(() => authStore.user, async (newUser) => {
  if (newUser) {
    try {
      loading.value = true
      await Promise.all([
        eventStore.loadEvents(),
        eventStore.loadUserBookings(newUser.uid)
      ])
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      loading.value = false
    }
  }
}, { immediate: true })

onMounted(async () => {
  if (!authStore.user) {
    router.push('/login')
    return
  }

  try {
    loading.value = true
    await Promise.all([
      eventStore.loadEvents(),
      eventStore.loadUserBookings(authStore.user.uid)
    ])
  } catch (error) {
    console.error('Failed to load data:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AppLayout>
    <div class="ticket-details">
      <!-- Header -->
      <header class="page-header">
        <button @click="router.back()" class="back-button">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h1>Ticket Details</h1>
      </header>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <span>Loading ticket...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="!event || !hasBooked" class="error-state">
        <i class="bi bi-exclamation-circle"></i>
        <p>Ticket not found or not booked</p>
        <button @click="router.back()" class="back-link">
          Go Back
        </button>
      </div>

      <!-- Ticket Content -->
      <main v-else class="ticket-content">
        <div class="ticket-card">
          <img :src="event.image" :alt="event.title" class="event-image">
          
          <div class="ticket-info">
            <span class="event-category">{{ event.category }}</span>
            <h2>{{ event.title }}</h2>
            
            <div class="info-grid">
              <div class="info-item">
                <i class="bi bi-calendar3"></i>
                <div>
                  <span class="label">Date</span>
                  <span class="value">{{ new Date(event.date).toLocaleDateString() }}</span>
                </div>
              </div>
              
              <div class="info-item">
                <i class="bi bi-clock"></i>
                <div>
                  <span class="label">Time</span>
                  <span class="value">{{ event.time }}</span>
                </div>
              </div>
              
              <div class="info-item">
                <i class="bi bi-geo-alt"></i>
                <div>
                  <span class="label">Location</span>
                  <span class="value">{{ event.location }}</span>
                </div>
              </div>
              
              <div class="info-item">
                <i class="bi bi-ticket-perforated"></i>
                <div>
                  <span class="label">Tickets Booked</span>
                  <span class="value">{{ booking?.quantity || 0 }}</span>
                </div>
              </div>
            </div>

            <div class="ticket-status" :class="event.status">
              <span class="status-badge">
                {{ event.status === 'active' ? 'Active' : 'Past' }}
              </span>
            </div>

            <div v-if="booking" class="booking-info">
              <div class="booking-details">
                <span class="label">Booking ID</span>
                <span class="value">{{ booking.id }}</span>
              </div>
              <div class="booking-details">
                <span class="label">Total Paid</span>
                <span class="value">${{ booking.totalPrice.toFixed(2) }}</span>
              </div>
              <div class="booking-details">
                <span class="label">Booked On</span>
                <span class="value">{{ new Date(booking.bookingDate).toLocaleDateString() }}</span>
              </div>
              
              <!-- Add QR Code section -->
              <div class="qr-section">
                <div class="qr-container">
                  <QRCode 
                    :value="qrValue"
                    :size="200"
                    level="H"
                    render-as="svg"
                  />
                </div>
                <p class="qr-help">Scan this QR code at the event</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </AppLayout>
</template>

<style scoped>
.ticket-details {
  min-height: 100vh;
  background: #fafafa;
}

.page-header {
  background: white;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.back-button {
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  background: #f8f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #1a1a1a;
  transition: all 0.2s ease;
}

.back-button:active {
  transform: scale(0.95);
  background: #e9ecef;
}

.page-header h1 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #1a1a1a;
}

.ticket-content {
  padding: 1rem;
}

.ticket-card {
  background: white;
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.event-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.ticket-info {
  padding: 1.5rem;
}

.event-category {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: #f0f7ff;
  color: #0d6efd;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.ticket-info h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1.5rem;
  color: #1a1a1a;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.info-item i {
  font-size: 1.25rem;
  color: #0d6efd;
}

.info-item div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  font-size: 0.75rem;
  color: #666;
}

.value {
  font-size: 0.9375rem;
  color: #1a1a1a;
  font-weight: 500;
}

.ticket-status {
  text-align: center;
}

.status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.active .status-badge {
  background: #e8f5e9;
  color: #198754;
}

.past .status-badge {
  background: #f8f9fa;
  color: #6c757d;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid #e9ecef;
  border-top-color: #0d6efd;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.error-state i {
  font-size: 3rem;
  color: #dc3545;
  margin-bottom: 1rem;
}

.back-link {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #f8f9fa;
  color: #666;
  border: none;
  border-radius: 1rem;
  font-weight: 500;
  margin-top: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* iOS safe area support */
@supports (padding-top: env(safe-area-inset-top)) {
  .page-header {
    padding-top: calc(1rem + env(safe-area-inset-top));
  }
}

.booking-info {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eaeaea;
}

.booking-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.booking-details:last-child {
  margin-bottom: 0;
}

.booking-details .label {
  font-size: 0.875rem;
  color: #666;
}

.booking-details .value {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #1a1a1a;
}

.qr-section {
  margin-top: 2rem;
  text-align: center;
}

.qr-container {
  background: white;
  padding: 1rem;
  border-radius: 1rem;
  display: inline-block;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.qr-help {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #666;
}

/* Make QR code responsive */
.qr-container :deep(svg) {
  max-width: 100%;
  height: auto;
}
</style> 