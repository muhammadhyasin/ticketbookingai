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
const showQRCode = ref(false)

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

const isEventPast = computed(() => {
  if (!event.value) return false
  return new Date(event.value.date) < new Date()
})

const toggleQRCode = () => {
  showQRCode.value = !showQRCode.value
}
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
      <div v-else-if="booking && event" class="ticket-container">
        <div class="ticket-card" :class="{ 'past-event': isEventPast }">
          <!-- Event Status Badge -->
          <div class="status-badge" :class="{ 'past': isEventPast }">
            {{ isEventPast ? 'Past Event' : 'Active' }}
          </div>

          <!-- Event Image -->
          <div class="event-image">
            <img :src="event.image" :alt="event.title">
          </div>

          <!-- Ticket Content -->
          <div class="ticket-content">
            <h2 class="event-title">{{ event.title }}</h2>
            <p class="booking-id">Booking ID: {{ booking.id }}</p>

            <div class="info-grid">
              <div class="info-item">
                <i class="bi bi-calendar-event"></i>
                <div>
                  <strong>Date</strong>
                  <span>{{ formatDate(new Date(event.date)) }}</span>
                </div>
              </div>

              <div class="info-item">
                <i class="bi bi-clock"></i>
                <div>
                  <strong>Time</strong>
                  <span>{{ event.time }}</span>
                </div>
              </div>

              <div class="info-item">
                <i class="bi bi-geo-alt"></i>
                <div>
                  <strong>Location</strong>
                  <span>{{ event.location }}</span>
                </div>
              </div>

              <div class="info-item">
                <i class="bi bi-ticket-perforated"></i>
                <div>
                  <strong>Quantity</strong>
                  <span>{{ booking.quantity }} ticket(s)</span>
                </div>
              </div>
            </div>

            <!-- Guide Service Badge -->
            <div v-if="booking.includeGuide" class="guide-badge">
              <i class="bi bi-person-badge"></i>
              Tour Guide Service Included
            </div>

            <!-- QR Code Section -->
            <div class="qr-section">
              <button @click="toggleQRCode" class="qr-toggle-btn">
                <i class="bi" :class="showQRCode ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                {{ showQRCode ? 'Hide QR Code' : 'Show QR Code' }}
              </button>
              
              <transition name="slide-fade">
                <div v-if="showQRCode" class="qr-code">
                  <img :src="qrCodeUrl" alt="Ticket QR Code">
                  <p class="text-muted">Show this QR code at the venue</p>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.ticket-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.ticket-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  position: relative;
  transition: transform 0.3s ease;
}

.ticket-card:hover {
  transform: translateY(-4px);
}

.past-event {
  opacity: 0.8;
}

.status-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  background: #10B981;
  color: white;
  font-weight: 500;
  z-index: 1;
}

.status-badge.past {
  background: #6B7280;
}

.event-image {
  height: 200px;
  overflow: hidden;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ticket-content {
  padding: 2rem;
}

.event-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.booking-id {
  color: #6B7280;
  font-size: 0.875rem;
  margin-bottom: 2rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.info-item i {
  font-size: 1.25rem;
  color: #3B82F6;
}

.info-item div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item strong {
  font-size: 0.875rem;
  color: #6B7280;
}

.guide-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #EFF6FF;
  color: #3B82F6;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
}

.qr-section {
  border-top: 1px solid #E5E7EB;
  padding-top: 1.5rem;
}

.qr-toggle-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: none;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.qr-toggle-btn:hover {
  background: #F9FAFB;
  color: #374151;
}

.qr-code {
  text-align: center;
  margin-top: 1.5rem;
}

.qr-code img {
  max-width: 200px;
  border: 1px solid #E5E7EB;
  padding: 1rem;
  border-radius: 0.5rem;
}

/* Animations */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

@media (max-width: 640px) {
  .info-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .ticket-content {
    padding: 1.5rem;
  }

  .event-image {
    height: 150px;
  }
}
</style> 