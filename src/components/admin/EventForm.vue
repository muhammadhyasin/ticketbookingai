<script setup lang="ts">
import { ref } from 'vue'
import { addEvent } from '../../services/firebase'
import type { Event } from '../../types/event'

const categories = ['Music', 'Sports', 'Technology', 'Arts', 'Food'] as const

const newEvent = ref({
  title: '',
  description: '',
  date: '',
  time: '',
  location: '',
  price: 0,
  category: 'Music' as Event['category'],
  image: '',
  capacity: 0,
  availableTickets: 0,
  status: 'Upcoming' as Event['status'],
  featured: false
})

const loading = ref(false)
const error = ref('')
const success = ref(false)

const handleSubmit = async () => {
  try {
    loading.value = true
    error.value = ''
    success.value = false

    // Set available tickets to match capacity if not specified
    if (!newEvent.value.availableTickets) {
      newEvent.value.availableTickets = newEvent.value.capacity
    }

    await addEvent(newEvent.value)
    success.value = true
    
    // Reset form
    newEvent.value = {
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      price: 0,
      category: 'Music',
      image: '',
      capacity: 0,
      availableTickets: 0,
      status: 'Upcoming',
      featured: false
    }
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="card border-0 shadow-sm">
    <div class="card-body p-4">
      <h4 class="card-title mb-4">Add New Event</h4>
      
      <form @submit.prevent="handleSubmit">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="form-group">
              <label class="form-label">Title</label>
              <input 
                v-model="newEvent.title"
                type="text"
                class="form-control"
                required
              >
            </div>
          </div>

          <div class="col-md-6">
            <div class="form-group">
              <label class="form-label">Category</label>
              <select 
                v-model="newEvent.category"
                class="form-select"
                required
              >
                <option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
          </div>

          <div class="col-md-6">
            <div class="form-group">
              <label class="form-label">Date</label>
              <input 
                v-model="newEvent.date"
                type="date"
                class="form-control"
                required
              >
            </div>
          </div>

          <div class="col-md-6">
            <div class="form-group">
              <label class="form-label">Time</label>
              <input 
                v-model="newEvent.time"
                type="time"
                class="form-control"
                required
              >
            </div>
          </div>

          <div class="col-12">
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea 
                v-model="newEvent.description"
                class="form-control"
                rows="3"
                required
              ></textarea>
            </div>
          </div>

          <div class="col-md-6">
            <div class="form-group">
              <label class="form-label">Location</label>
              <input 
                v-model="newEvent.location"
                type="text"
                class="form-control"
                required
              >
            </div>
          </div>

          <div class="col-md-6">
            <div class="form-group">
              <label class="form-label">Image URL</label>
              <input 
                v-model="newEvent.image"
                type="url"
                class="form-control"
                required
              >
            </div>
          </div>

          <div class="col-md-4">
            <div class="form-group">
              <label class="form-label">Price ($)</label>
              <input 
                v-model.number="newEvent.price"
                type="number"
                step="0.01"
                min="0"
                class="form-control"
                required
              >
            </div>
          </div>

          <div class="col-md-4">
            <div class="form-group">
              <label class="form-label">Capacity</label>
              <input 
                v-model.number="newEvent.capacity"
                type="number"
                min="1"
                class="form-control"
                required
              >
            </div>
          </div>

          <div class="col-md-4">
            <div class="form-group">
              <label class="form-label">Available Tickets</label>
              <input 
                v-model.number="newEvent.availableTickets"
                type="number"
                min="0"
                :max="newEvent.capacity"
                class="form-control"
              >
            </div>
          </div>

          <div class="col-12">
            <div class="form-check">
              <input 
                v-model="newEvent.featured"
                type="checkbox"
                class="form-check-input"
                id="featured"
              >
              <label class="form-check-label" for="featured">
                Featured Event
              </label>
            </div>
          </div>
        </div>

        <div class="mt-4">
          <div v-if="error" class="alert alert-danger">{{ error }}</div>
          <div v-if="success" class="alert alert-success">Event added successfully!</div>

          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'Adding Event...' : 'Add Event' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template> 