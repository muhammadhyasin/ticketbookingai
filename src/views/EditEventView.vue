<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEventStore } from '../stores/events'
import AppLayout from '../components/layout/AppLayout.vue'
import type { Event } from '../types/event'

const router = useRouter()
const route = useRoute()
const eventStore = useEventStore()
const loading = ref(false)
const error = ref('')

const eventData = ref<Event | null>(null)

onMounted(async () => {
  try {
    loading.value = true
    const event = await eventStore.getEventById(route.params.id as string)
    if (!event) {
      router.push('/admin')
      return
    }
    eventData.value = event
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})

const handleSubmit = async () => {
  if (!eventData.value) return

  try {
    loading.value = true
    error.value = ''
    
    await eventStore.updateEvent(eventData.value)
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
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="card-title mb-0">Edit Event</h2>
                <button 
                  class="btn btn-outline-secondary"
                  @click="router.push('/admin')"
                >
                  Cancel
                </button>
              </div>

              <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>

              <form v-else-if="eventData" @submit.prevent="handleSubmit">
                <div class="mb-3">
                  <label class="form-label">Event Title</label>
                  <input
                    v-model="eventData.title"
                    type="text"
                    class="form-control"
                    required
                  >
                </div>

                <div class="mb-3">
                  <label class="form-label">Description</label>
                  <textarea
                    v-model="eventData.description"
                    class="form-control"
                    rows="3"
                    required
                  ></textarea>
                </div>

                <div class="row mb-3">
                  <div class="col-md-6">
                    <label class="form-label">Date</label>
                    <input
                      v-model="eventData.date"
                      type="date"
                      class="form-control"
                      required
                    >
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Time</label>
                    <input
                      v-model="eventData.time"
                      type="time"
                      class="form-control"
                      required
                    >
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Location</label>
                  <input
                    v-model="eventData.location"
                    type="text"
                    class="form-control"
                    required
                  >
                </div>

                <div class="row mb-3">
                  <div class="col-md-6">
                    <label class="form-label">Price</label>
                    <input
                      v-model.number="eventData.price"
                      type="number"
                      class="form-control"
                      min="0"
                      required
                    >
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Available Tickets</label>
                    <input
                      v-model.number="eventData.availableTickets"
                      type="number"
                      class="form-control"
                      min="0"
                      required
                    >
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Image URL</label>
                  <input
                    v-model="eventData.image"
                    type="url"
                    class="form-control"
                    required
                  >
                </div>

                <div class="mb-3">
                  <div class="form-check">
                    <input
                      v-model="eventData.guideAvailable"
                      type="checkbox"
                      class="form-check-input"
                      id="guideAvailable"
                    >
                    <label class="form-check-label" for="guideAvailable">
                      Guide Available
                    </label>
                  </div>
                </div>

                <div v-if="error" class="alert alert-danger">
                  {{ error }}
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-100"
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template> 