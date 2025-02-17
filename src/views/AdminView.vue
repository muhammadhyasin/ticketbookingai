<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEventStore } from '../stores/events'
import { useAdminStore } from '../stores/admin'
import AppLayout from '../components/layout/AppLayout.vue'
import type { Event } from '../types/event'

const router = useRouter()
const eventStore = useEventStore()
const adminStore = useAdminStore()
const loading = ref(false)
const deleteConfirmation = ref<Event | null>(null)

onMounted(() => {
  eventStore.loadEvents()
})

// Handle delete event
const handleDelete = async (event: Event) => {
  if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
    try {
      loading.value = true
      await eventStore.deleteEvent(event.id)
      // Reload events after deletion
      await eventStore.loadEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Failed to delete event')
    } finally {
      loading.value = false
    }
  }
}

// Handle edit event
const handleEdit = (event: Event) => {
  router.push(`/admin/events/${event.id}/edit`)
}
</script>

<template>
  <AppLayout>
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 mb-0">Event Management</h1>
        <router-link 
          to="/admin/events/new" 
          class="btn btn-primary"
          v-if="adminStore.isAdmin"
        >
          <i class="bi bi-plus-lg me-2"></i>
          Add New Event
        </router-link>
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else class="row g-4">
        <div v-for="event in eventStore.events" 
             :key="event.id" 
             class="col-md-6 col-lg-4">
          <div class="card h-100 border-0 shadow-sm">
            <img :src="event.image" 
                 class="card-img-top" 
                 :alt="event.title"
                 style="height: 200px; object-fit: cover;">
            <div class="card-body">
              <h5 class="card-title">{{ event.title }}</h5>
              <p class="text-muted mb-2">
                <i class="bi bi-calendar3 me-2"></i>
                {{ new Date(event.date).toLocaleDateString() }}
              </p>
              <p class="text-muted mb-3">
                <i class="bi bi-ticket-perforated me-2"></i>
                {{ event.availableTickets }} tickets available
              </p>
              <div class="d-flex justify-content-between align-items-center">
                <span class="badge"
                      :class="event.status === 'active' ? 'bg-success' : 'bg-secondary'">
                  {{ event.status }}
                </span>
                <div class="btn-group">
                  <button class="btn btn-outline-primary btn-sm"
                          @click="handleEdit(event)"
                          :disabled="loading">
                    <i class="bi bi-pencil me-1"></i>
                    Edit
                  </button>
                  <button class="btn btn-outline-danger btn-sm"
                          @click="handleDelete(event)"
                          :disabled="loading">
                    <i class="bi bi-trash me-1"></i>
                    Delete
                  </button>
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
.card {
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.btn-group .btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.badge {
  padding: 0.5rem 0.75rem;
  font-weight: 500;
}
</style> 