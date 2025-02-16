<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useEventStore } from '../stores/events'
import { useAdminStore } from '../stores/admin'
import AppLayout from '../components/layout/AppLayout.vue'
import type { Event } from '../types/event'

const eventStore = useEventStore()
const adminStore = useAdminStore()

onMounted(() => {
  eventStore.loadEvents()
})
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

      <div class="row g-4">
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
              <p class="text-muted mb-3">
                <i class="bi bi-calendar3 me-2"></i>
                {{ new Date(event.date).toLocaleDateString() }}
              </p>
              <div class="d-flex justify-content-between align-items-center">
                <span class="badge bg-primary">{{ event.category }}</span>
                <div class="btn-group">
                  <button class="btn btn-outline-primary btn-sm"
                          @click="router.push(`/admin/events/${event.id}/edit`)">
                    <i class="bi bi-pencil me-1"></i>
                    Edit
                  </button>
                  <button class="btn btn-outline-danger btn-sm"
                          @click="handleDelete(event)">
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