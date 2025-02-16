<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import EventForm from '../components/admin/EventForm.vue'
import { getEvents } from '../services/events'
import type { Event } from '../types/event'

const events = ref<Event[]>([])
const loading = ref(true)
const error = ref('')

const loadEvents = async () => {
  try {
    loading.value = true
    error.value = ''
    events.value = await getEvents()
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(loadEvents)
</script>

<template>
  <AppLayout>
    <div class="container py-4">
      <div class="row g-4">
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h4 class="mb-0">Event Management</h4>
                <button 
                  class="btn btn-outline-primary"
                  @click="loadEvents"
                >
                  <i class="bi bi-arrow-clockwise me-2"></i>
                  Refresh
                </button>
              </div>

              <div v-if="loading" class="text-center py-4">
                <div class="spinner-border text-primary"></div>
              </div>

              <div v-else-if="error" class="alert alert-danger">
                {{ error }}
              </div>

              <div v-else class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Available</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="event in events" :key="event.id">
                      <td>{{ event.title }}</td>
                      <td>{{ new Date(event.date).toLocaleDateString() }}</td>
                      <td>
                        <span class="badge bg-primary">{{ event.category }}</span>
                      </td>
                      <td>${{ event.price.toFixed(2) }}</td>
                      <td>{{ event.availableTickets }}/{{ event.capacity }}</td>
                      <td>
                        <span 
                          class="badge"
                          :class="`bg-${event.status === 'Upcoming' ? 'success' : 'warning'}`"
                        >
                          {{ event.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <EventForm @event-added="loadEvents" />
        </div>
      </div>
    </div>
  </AppLayout>
</template> 