<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEventStore } from '../stores/events'
import AppLayout from '../components/layout/AppLayout.vue'
import type { Event } from '../types/event'

const router = useRouter()
const eventStore = useEventStore()
const loading = ref(false)
const error = ref('')

const newEvent = ref<Omit<Event, 'id'>>({
  title: '',
  description: '',
  date: '',
  time: '',
  location: '',
  category: '',
  price: 0,
  capacity: 0,
  availableTickets: 0,
  image: '',
  status: 'Upcoming'
})

const handleSubmit = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // Set available tickets to match capacity initially
    newEvent.value.availableTickets = newEvent.value.capacity
    
    await eventStore.addEvent(newEvent.value)
    router.push('/admin')
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AppLayout>
    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <h2 class="card-title mb-4">Add New Event</h2>

              <form @submit.prevent="handleSubmit">
                <!-- Title -->
                <div class="mb-3">
                  <label class="form-label">Event Title</label>
                  <input
                    v-model="newEvent.title"
                    type="text"
                    class="form-control"
                    required
                  >
                </div>

                <!-- Description -->
                <div class="mb-3">
                  <label class="form-label">Description</label>
                  <textarea
                    v-model="newEvent.description"
                    class="form-control"
                    rows="3"
                    required
                  ></textarea>
                </div>

                <!-- Date and Time -->
                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label class="form-label">Date</label>
                    <input
                      v-model="newEvent.date"
                      type="date"
                      class="form-control"
                      required
                    >
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Time</label>
                    <input
                      v-model="newEvent.time"
                      type="time"
                      class="form-control"
                      required
                    >
                  </div>
                </div>

                <!-- Location -->
                <div class="mb-3">
                  <label class="form-label">Location</label>
                  <input
                    v-model="newEvent.location"
                    type="text"
                    class="form-control"
                    required
                  >
                </div>

                <!-- Category -->
                <div class="mb-3">
                  <label class="form-label">Category</label>
                  <select
                    v-model="newEvent.category"
                    class="form-select"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Concert">Concert</option>
                    <option value="Sports">Sports</option>
                    <option value="Theater">Theater</option>
                    <option value="Conference">Conference</option>
                    <option value="Exhibition">Exhibition</option>
                  </select>
                </div>

                <!-- Price and Capacity -->
                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label class="form-label">Price ($)</label>
                    <input
                      v-model.number="newEvent.price"
                      type="number"
                      class="form-control"
                      min="0"
                      step="0.01"
                      required
                    >
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Capacity</label>
                    <input
                      v-model.number="newEvent.capacity"
                      type="number"
                      class="form-control"
                      min="1"
                      required
                    >
                  </div>
                </div>

                <!-- Image URL -->
                <div class="mb-4">
                  <label class="form-label">Image URL</label>
                  <input
                    v-model="newEvent.image"
                    type="url"
                    class="form-control"
                    required
                  >
                </div>

                <!-- Error Alert -->
                <div v-if="error" class="alert alert-danger mb-3">
                  {{ error }}
                </div>

                <!-- Submit Button -->
                <div class="d-flex justify-content-between">
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="router.push('/admin')"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="btn btn-primary"
                    :disabled="loading"
                  >
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading ? 'Creating...' : 'Create Event' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.form-label {
  font-weight: 500;
}
</style> 