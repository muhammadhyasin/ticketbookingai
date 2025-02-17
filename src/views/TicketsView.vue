<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import { useRouter } from 'vue-router'
import { useEventStore } from '../stores/events'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
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

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Confirmed':
      return 'status-confirmed'
    case 'Pending':
      return 'status-pending'
    case 'Cancelled':
      return 'status-cancelled'
    default:
      return ''
  }
}
</script>

<template>
  <AppLayout>
    <div class="tickets-page">
      <!-- Header -->
      <header class="page-header">
        <button @click="router.back()" class="back-button">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h1>My Tickets</h1>
      </header>

      <!-- Main Content -->
      <main class="tickets-content">
        <!-- Loading State -->
        <div v-if="eventStore.loading" class="loading-state">
          <div class="spinner"></div>
          <span>Loading tickets...</span>
        </div>

        <!-- Empty State -->
        <div v-else-if="eventStore.bookings.length === 0" class="empty-state">
          <i class="bi bi-ticket-detailed"></i>
          <p>No tickets found</p>
          <router-link to="/dashboard" class="browse-button">
            Browse Events
          </router-link>
        </div>

        <!-- Tickets List -->
        <div v-else class="tickets-list">
          <div v-for="booking in eventStore.bookings" 
               :key="booking.id"
               class="ticket-card"
               @click="router.push(`/tickets/${booking.id}`)"
          >
            <div class="ticket-header">
              <div class="event-info">
                <span class="event-name">
                  {{ eventStore.events.find(e => e.id === booking.eventId)?.title }}
                </span>
                <span class="booking-id">Booking #{{ booking.id }}</span>
              </div>
              <span :class="['status-badge', getStatusClass(booking.status)]">
                {{ booking.status }}
              </span>
            </div>

            <div class="ticket-details">
              <div class="detail-item">
                <i class="bi bi-calendar3"></i>
                <span>{{ formatDate(booking.bookingDate) }}</span>
              </div>
              <div class="detail-item">
                <i class="bi bi-ticket-perforated"></i>
                <span>{{ booking.quantity }} {{ booking.quantity > 1 ? 'tickets' : 'ticket' }}</span>
              </div>
              <div class="detail-item">
                <i class="bi bi-wallet2"></i>
                <span>${{ booking.totalPrice.toFixed(2) }}</span>
              </div>
            </div>

            <div class="ticket-footer">
              <span class="view-details">
                View Details <i class="bi bi-chevron-right"></i>
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  </AppLayout>
</template>

<style scoped>
.tickets-page {
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

.tickets-content {
  padding: 1rem;
}

.loading-state,
.empty-state {
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

.empty-state i {
  font-size: 3rem;
  color: #666;
  margin-bottom: 1rem;
  display: block;
}

.browse-button {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: #0d6efd;
  color: white;
  border-radius: 1rem;
  text-decoration: none;
  font-weight: 500;
  margin-top: 1rem;
  transition: all 0.2s ease;
}

.browse-button:hover {
  background: #0b5ed7;
}

.tickets-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ticket-card {
  background: white;
  border-radius: 1.25rem;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: all 0.2s ease;
}

.ticket-card:active {
  transform: scale(0.98);
  background: #f8f9fa;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.event-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.event-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
}

.booking-id {
  font-size: 0.75rem;
  color: #666;
}

.status-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-confirmed {
  background: #e8f5e9;
  color: #198754;
}

.status-pending {
  background: #fff3cd;
  color: #997404;
}

.status-cancelled {
  background: #f8d7da;
  color: #dc3545;
}

.ticket-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem 0;
  border-top: 1px solid #eaeaea;
  border-bottom: 1px solid #eaeaea;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #666;
}

.detail-item i {
  color: #0d6efd;
}

.ticket-footer {
  display: flex;
  justify-content: flex-end;
}

.view-details {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #0d6efd;
  font-weight: 500;
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

/* Tablet and larger screens */
@media (min-width: 768px) {
  .tickets-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 