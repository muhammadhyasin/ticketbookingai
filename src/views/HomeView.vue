<script setup lang="ts">
import AppLayout from '../components/layout/AppLayout.vue'
import ChatInterface from '../components/chat/ChatInterface.vue'
</script>

<template>
  <AppLayout>
    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="text-center mb-4">
            <h1 class="display-5 fw-bold mb-3">Event Booking Assistant</h1>
            <p class="lead text-muted">
              Chat with our AI assistant to find and book events that interest you
            </p>
          </div>
          <ChatInterface />
        </div>
      </div>
    </div>
  </AppLayout>
</template> 