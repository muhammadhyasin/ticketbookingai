<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useEventStore } from '../stores/events'
import AppLayout from '../components/layout/AppLayout.vue'
import QRCode from 'qrcode.vue'
import type { Booking } from '../stores/events'
import type { Event } from '../types/event'

const route = useRoute()
const eventStore = useEventStore()
const booking = ref<Booking | null>(null)
const event = ref<Event | null>(null)
const loading = ref(true)
const error = ref('')

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Create QR code data
const qrCodeData = computed(() => {
  if (!booking.value || !event.value) return ''
  
  // Create the full URL for the ticket
  const ticketUrl = `${window.location.origin}/tickets/${booking.value.id}`
  
  return JSON.stringify({
    url: ticketUrl,
    bookingId: booking.value.id,
    eventId: event.value.id,
    eventTitle: event.value.title,
    date: event.value.date,
    time: event.value.time,
    quantity: booking.value.quantity,
    status: booking.value.status
  })
})

onMounted(async () => {
  try {
    loading.value = true
    const bookingId = route.params.id as string
    
    // Load events if not already loaded
    if (eventStore.events.length === 0) {
      await eventStore.loadEvents()
    }
    
    // Find booking
    const foundBooking = eventStore.bookings.find(b => b.id === bookingId)
    if (!foundBooking) {
      throw new Error('Booking not found')
    }
    booking.value = foundBooking
    
    // Find associated event
    const foundEvent = eventStore.events.find(e => e.id === foundBooking.eventId)
    if (!foundEvent) {
      throw new Error('Event not found')
    }
    event.value = foundEvent
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AppLayout>
    <div class="container py-4">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>

      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <template v-else-if="booking && event">
        <!-- Ticket Header -->
        <div class="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h1 class="display-6 fw-bold mb-2">Ticket Details</h1>
            <p class="text-muted mb-0">Booking ID: {{ booking.id }}</p>
          </div>
          <span 
            class="badge"
            :class="`bg-${booking.status === 'Confirmed' ? 'success' : 'warning'} fs-6`"
          >
            {{ booking.status }}
          </span>
        </div>

        <div class="row g-4">
          <!-- Event Details -->
          <div class="col-lg-8">
            <div class="card border-0 shadow-sm">
              <img 
                :src="event.image" 
                :alt="event.title"
                class="card-img-top"
                style="height: 300px; object-fit: cover;"
              >
              <div class="card-body p-4">
                <h2 class="h4 fw-bold mb-3">{{ event.title }}</h2>
                
                <div class="row g-3 mb-4">
                  <div class="col-md-6">
                    <div class="d-flex align-items-center">
                      <div class="bg-primary-subtle p-2 rounded me-3">
                        <i class="bi bi-calendar3 text-primary"></i>
                      </div>
                      <div>
                        <div class="text-muted small">Date</div>
                        <div>{{ formatDate(new Date(event.date)) }}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-md-6">
                    <div class="d-flex align-items-center">
                      <div class="bg-primary-subtle p-2 rounded me-3">
                        <i class="bi bi-clock text-primary"></i>
                      </div>
                      <div>
                        <div class="text-muted small">Time</div>
                        <div>{{ event.time }}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-md-6">
                    <div class="d-flex align-items-center">
                      <div class="bg-primary-subtle p-2 rounded me-3">
                        <i class="bi bi-geo-alt text-primary"></i>
                      </div>
                      <div>
                        <div class="text-muted small">Location</div>
                        <div>{{ event.location }}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-md-6">
                    <div class="d-flex align-items-center">
                      <div class="bg-primary-subtle p-2 rounded me-3">
                        <i class="bi bi-tag text-primary"></i>
                      </div>
                      <div>
                        <div class="text-muted small">Category</div>
                        <div>{{ event.category }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <p class="mb-0">{{ event.description }}</p>
              </div>
            </div>
          </div>

          <!-- Booking Details -->
          <div class="col-lg-4">
            <div class="card border-0 shadow-sm">
              <div class="card-body p-4">
                <h3 class="h5 fw-bold mb-4">Booking Information</h3>
                
                <div class="mb-4">
                  <div class="text-muted small mb-1">Booked On</div>
                  <div>{{ formatDate(booking.bookingDate) }}</div>
                </div>

                <div class="mb-4">
                  <div class="text-muted small mb-1">Tickets</div>
                  <div class="h4 mb-0">{{ booking.quantity }}</div>
                </div>

                <div class="mb-4">
                  <div class="text-muted small mb-1">Price per Ticket</div>
                  <div>${{ event.price.toFixed(2) }}</div>
                </div>

                <hr>

                <div class="d-flex justify-content-between align-items-center mb-3">
                  <div class="text-muted">Total Amount</div>
                  <div class="h4 mb-0">${{ booking.totalPrice.toFixed(2) }}</div>
                </div>

                <!-- Add QR Code section -->
                <div class="text-center mt-4">
                  <div class="qr-code-container bg-light rounded-3 p-4 d-inline-block mb-3">
                    <QRCode 
                      :value="qrCodeData"
                      :size="200"
                      level="H"
                      render-as="svg"
                    />
                  </div>
                  <div class="text-muted small">
                    Show this QR code at the venue for entry
                  </div>
                </div>

                <div class="d-grid gap-2 mt-4">
                  <button 
                    class="btn btn-outline-primary"
                    @click="$router.go(-1)"
                  >
                    <i class="bi bi-arrow-left me-2"></i>
                    Back to Bookings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<style scoped>
.badge {
  padding: 0.5rem 1rem;
}

.qr-code-container {
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}
</style> 