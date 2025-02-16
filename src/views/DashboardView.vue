<script setup lang="ts">
import { computed, onMounted } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import BookedEvents from '../components/events/BookedEvents.vue'
import { useAuthStore } from '../stores/auth'
import { useEventStore } from '../stores/events'
import type { Event } from '../types/event'

const authStore = useAuthStore()
const eventStore = useEventStore()

onMounted(() => {
  eventStore.loadEvents()
})

// Dynamic stats
const stats = computed(() => [
  {
    title: 'Active Tickets',
    value: eventStore.activeTickets.toString(),
    icon: 'bi-ticket-perforated',
    color: 'primary'
  },
  {
    title: 'Past Events',
    value: eventStore.pastEvents.toString(),
    icon: 'bi-calendar-check',
    color: 'success'
  },
  {
    title: 'Total Spent',
    value: `$${eventStore.totalSpent.toFixed(2)}`,
    icon: 'bi-wallet2',
    color: 'info'
  },
  {
    title: 'Reward Points',
    value: Math.floor(eventStore.totalSpent).toString(),
    icon: 'bi-star',
    color: 'warning'
  }
])
</script>

<template>
  <AppLayout>
    <div class="container py-4">
      <!-- Welcome Section -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="display-6 fw-bold mb-0">Welcome back, {{ authStore.userEmail?.split('@')[0] }}</h1>
          <p class="text-muted">Here's what's happening with your events</p>
        </div>
        <router-link to="/admin" class="btn btn-primary d-flex align-items-center">
          <i class="bi bi-plus-lg me-2"></i> Manage Events
        </router-link>
      </div>

      <!-- Stats Cards -->
      <div class="row g-4 mb-4">
        <div v-for="stat in stats" 
             :key="stat.title" 
             class="col-md-3">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div :class="`bg-${stat.color}-subtle p-3 rounded-3 me-3`">
                  <i :class="`bi ${stat.icon} fs-4 text-${stat.color}`"></i>
                </div>
                <div>
                  <h6 class="text-muted mb-1">{{ stat.title }}</h6>
                  <h4 class="mb-0 fw-bold">{{ stat.value }}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <!-- Booked Events -->
        <div class="col-12">
          <BookedEvents />
        </div>

        <!-- Available Events -->
        <div class="col-12">
          <!-- Events List -->
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <h4 class="mb-4">Your Upcoming Events</h4>
              
              <div v-if="eventStore.loading" class="text-center py-4">
                <div class="spinner-border text-primary"></div>
              </div>
              
              <div v-else-if="eventStore.events.length === 0" class="text-center py-4">
                <i class="bi bi-calendar-x display-1 text-muted mb-3"></i>
                <p class="lead">No upcoming events found</p>
                <router-link to="/admin" class="btn btn-primary">
                  Add New Event
                </router-link>
              </div>
              
              <div v-else class="row g-4">
                <div v-for="event in eventStore.events" 
                     :key="event.id" 
                     class="col-md-6">
                  <div class="card h-100 border-0 shadow-sm">
                    <img :src="event.image" 
                         class="card-img-top" 
                         :alt="event.title"
                         style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                      <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title mb-0">{{ event.title }}</h5>
                        <span class="badge bg-primary">{{ event.category }}</span>
                      </div>
                      <p class="text-muted mb-3">
                        <i class="bi bi-calendar3 me-2"></i>
                        {{ new Date(event.date).toLocaleDateString() }}
                        <i class="bi bi-clock ms-3 me-2"></i>
                        {{ event.time }}
                      </p>
                      <p class="card-text">{{ event.description }}</p>
                    </div>
                    <div class="card-footer bg-white border-top-0">
                      <div class="d-flex justify-content-between align-items-center">
                        <div class="text-muted">
                          <i class="bi bi-ticket-perforated me-2"></i>
                          {{ event.availableTickets }} available
                        </div>
                        <div class="fw-bold fs-5">${{ event.price.toFixed(2) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.table > :not(caption) > * > * {
  padding: 1rem;
}

.dropdown-toggle-split {
  border-left: none;
}

.card {
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
}
</style> 