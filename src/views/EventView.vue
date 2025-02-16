<script setup lang="ts">
import { useRoute } from 'vue-router'
import { getEventById } from '../services/events'
import EventBookingCard from '../components/events/EventBookingCard.vue'
import AppLayout from '../components/layout/AppLayout.vue'

const route = useRoute()
const event = getEventById(route.params.id as string)
</script>

<template>
  <AppLayout>
    <div class="container py-5">
      <div class="row g-4">
        <div class="col-lg-8">
          <!-- Event Details -->
          <div v-if="event" class="card border-0 shadow-sm">
            <img :src="event.image" class="card-img-top" :alt="event.title">
            <div class="card-body p-4">
              <h1 class="display-6 fw-bold mb-4">{{ event.title }}</h1>
              <p class="lead mb-4">{{ event.description }}</p>
              <!-- Add more event details here -->
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <!-- Booking Card -->
          <EventBookingCard v-if="event" :event="event" />
        </div>
      </div>
    </div>
  </AppLayout>
</template> 