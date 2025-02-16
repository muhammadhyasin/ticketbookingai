<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { useChatStore } from '../../stores/chat'
import { useEventStore } from '../../stores/events'
import type { Message } from '../../stores/chat'
import type { Event } from '../../types/event'
import QRCode from 'qrcode.vue'
import PaymentModal from '../payment/PaymentModal.vue'
import { useRouter } from 'vue-router'

const chatStore = useChatStore()
const eventStore = useEventStore()
const newMessage = ref('')
const chatContainer = ref<HTMLElement | null>(null)
const router = useRouter()

// Create a ref for storing booking data
const currentBooking = ref<{
  bookingId: string;
  event: Event;
  quantity: number;
} | null>(null)

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const sendMessage = async (content: string) => {
  if (!newMessage.value.trim() && !content) return
  
  const messageContent = content || newMessage.value
  newMessage.value = ''
  
  await chatStore.sendMessage(messageContent)
  await scrollToBottom()
}

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date)
}

// Function to check if the message contains event listings
const isEventListing = (message: string) => {
  return message.includes('[EVENTS_LIST]')
}

// Function to get events for listing
const getEventsForListing = () => {
  return eventStore.events
}

// Function to parse events from the message
const parseEvents = (message: string): Event[] => {
  const events = eventStore.events
  const mentionedEvents = events.filter(event => message.includes(event.id))
  return mentionedEvents
}

const formatBookingMessage = (content: string) => {
  // Find the index where the JSON starts
  const jsonStartIndex = content.indexOf('{')
  if (jsonStartIndex === -1) return content
  
  // Return only the text part before the JSON
  return content.substring(0, jsonStartIndex).trim()
}

const generateQRData = (bookingId: string, event: Event, quantity: number) => {
  // Create the full URL for the ticket
  const ticketUrl = `${window.location.origin}/tickets/${bookingId}`
  
  return JSON.stringify({
    url: ticketUrl,
    bookingId,
    eventId: event.id,
    eventTitle: event.title,
    date: event.date,
    time: event.time,
    quantity: quantity,
    status: 'Confirmed'
  })
}

const formatMessageWithLinks = (content: string) => {
  if (!content.includes('/tickets/')) return content

  const bookingId = content.match(/\/tickets\/([a-zA-Z0-9-]+)/)?.[1]
  if (!bookingId) return content

  const booking = eventStore.bookings.find(b => b.id === bookingId)
  const event = booking ? eventStore.events.find(e => e.id === booking.eventId) : null

  if (!booking || !event) return content

  // Store booking data for QR code rendering
  currentBooking.value = {
    bookingId,
    event,
    quantity: booking.quantity
  }

  return `
    <div class="booking-confirmation-card bg-light rounded p-3 mb-3">
      <div class="text-center mb-3">
        <div class="qr-code-container bg-white rounded p-3 d-inline-block">
          <div class="qr-code-placeholder"></div>
        </div>
      </div>
      <div class="booking-details">
        <h6 class="fw-bold mb-2">${event.title}</h6>
        <div class="text-muted small mb-2">
          <i class="bi bi-calendar3 me-2"></i>${new Date(event.date).toLocaleDateString()}
          <i class="bi bi-clock ms-3 me-2"></i>${event.time}
        </div>
        <div class="text-muted small mb-2">
          <i class="bi bi-ticket-perforated me-2"></i>${booking.quantity} ticket(s)
        </div>
        <div class="d-flex justify-content-between align-items-center">
          <span class="badge bg-success">Confirmed</span>
          <router-link to="/tickets/${bookingId}" class="btn btn-primary btn-sm">
            View Details
          </router-link>
        </div>
      </div>
    </div>
    ${content}`
}

// Add computed for payment amount
const paymentAmount = computed(() => {
  if (!chatStore.pendingBooking) return 0
  const event = eventStore.events.find(e => e.id === chatStore.pendingBooking?.eventId)
  if (!event) return 0
  return event.price * chatStore.pendingBooking.quantity
})

const handlePaymentSuccess = async (navigate: boolean) => {
  const bookingId = await chatStore.completePendingBooking()
  if (navigate && bookingId) {
    router.push(`/tickets/${bookingId}`)
  }
}

onMounted(() => {
  chatStore.initializeChat()
})
</script>

<template>
  <div class="chat-widget card border-0 shadow-lg">
    <!-- Chat Header -->
    <div class="card-header bg-primary text-white py-3">
      <div class="d-flex align-items-center">
        <i class="bi bi-robot fs-4 me-2"></i>
        <div>
          <h5 class="mb-0">Event Assistant</h5>
          <small>AI-powered booking help</small>
        </div>
      </div>
    </div>

    <!-- Chat Messages -->
    <div 
      ref="chatContainer"
      class="card-body chat-messages p-4"
    >
      <div v-if="!chatStore.messages.length" class="text-center text-muted my-4">
        <i class="bi bi-chat-dots display-4 mb-3 d-block"></i>
        <p>Start a conversation with our AI assistant to get help with event booking!</p>
        <button 
          @click="sendMessage('List all available events')" 
          class="btn btn-primary"
        >
          Show Available Events
        </button>
      </div>

      <template v-for="(message, index) in chatStore.messages" :key="index">
        <div 
          :class="[
            'message mb-3 d-flex',
            message.role === 'user' ? 'justify-content-end' : 'justify-content-start'
          ]"
        >
          <div 
            :class="[
              'message-content p-3 rounded-3',
              message.role === 'user' ? 'bg-primary text-white' : 'bg-light'
            ]"
            style="max-width: 80%;"
          >
            <div class="message-text">
              <pre v-if="message.content.includes('📋 Booking Confirmation')" 
                   class="booking-confirmation">{{ formatBookingMessage(message.content) }}</pre>
              <template v-else>
                <div v-if="message.content.includes('/tickets/')" 
                     class="booking-confirmation-wrapper">
                  <div v-html="formatMessageWithLinks(message.content)" />
                  <!-- Render QR code separately -->
                  <QRCode v-if="currentBooking"
                          :value="generateQRData(
                            currentBooking.bookingId,
                            currentBooking.event,
                            currentBooking.quantity
                          )"
                          :size="150"
                          level="H"
                          render-as="svg"
                          class="qr-code-overlay"
                  />
                </div>
                <template v-else>
                  {{ message.content.replace('[EVENTS_LIST]', '') }}
                </template>
              </template>
              
              <!-- Event Quick Actions -->
              <div v-if="message.role === 'assistant' && isEventListing(message.content)" 
                   class="event-quick-actions mt-3">
                <div v-for="event in getEventsForListing()" 
                     :key="event.id" 
                     class="event-action-card mb-2 p-3 bg-white rounded-3 shadow-sm">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="mb-0 text-dark">{{ event.title }}</h6>
                    <span class="badge bg-primary">{{ event.category }}</span>
                  </div>
                  <div class="d-flex justify-content-between align-items-center text-muted small mb-2">
                    <span>
                      <i class="bi bi-calendar3 me-1"></i>
                      {{ new Date(event.date).toLocaleDateString() }}
                    </span>
                    <span>
                      <i class="bi bi-ticket-perforated me-1"></i>
                      {{ event.availableTickets }} available
                    </span>
                  </div>
                  <div class="d-flex gap-2">
                    <button 
                      @click="sendMessage(`Tell me more about ${event.title}`)"
                      class="btn btn-outline-primary btn-sm flex-grow-1"
                    >
                      <i class="bi bi-info-circle me-1"></i> Details
                    </button>
                    <button 
                      @click="sendMessage(`I want to book 1 ticket for ${event.title}`)"
                      class="btn btn-primary btn-sm flex-grow-1"
                    >
                      <i class="bi bi-ticket me-1"></i> Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div 
              :class="[
                'message-time small mt-2',
                message.role === 'user' ? 'text-white-50' : 'text-muted'
              ]"
            >
              {{ formatTime(message.timestamp) }}
            </div>
          </div>
        </div>
      </template>

      <!-- Loading Indicator -->
      <div v-if="chatStore.isLoading" class="message mb-3 d-flex justify-content-start">
        <div class="message-content p-3 rounded-3 bg-light">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Input -->
    <div class="card-footer border-top p-3">
      <form @submit.prevent="sendMessage()" class="d-flex gap-2">
        <input
          v-model="newMessage"
          type="text"
          class="form-control"
          placeholder="Type your message..."
          :disabled="chatStore.isLoading"
        >
        <button 
          type="submit" 
          class="btn btn-primary px-4"
          :disabled="!newMessage.trim() || chatStore.isLoading"
        >
          <i class="bi bi-send"></i>
        </button>
      </form>
    </div>
  </div>

  <!-- Add at the end of the template -->
  <PaymentModal
    :show="chatStore.showPayment"
    :amount="paymentAmount"
    @success="handlePaymentSuccess"
    @cancel="chatStore.showPayment = false"
  />
</template>

<style scoped>
.chat-widget {
  height: 600px;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
}

.message-content {
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.event-action-card {
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid rgba(0,0,0,0.1);
}

.event-action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.event-quick-actions {
  max-width: 600px;
}

/* Typing indicator animation */
.typing-indicator {
  display: flex;
  gap: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background-color: #6c757d;
  border-radius: 50%;
  animation: typing 1s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* Custom scrollbar */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #999;
}

.booking-confirmation {
  font-family: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  white-space: pre-line;
  color: inherit;
}

.message-text :deep(a) {
  text-decoration: none;
}

.message-text :deep(a:hover) {
  text-decoration: underline;
}

.booking-confirmation-wrapper {
  position: relative;
}

.qr-code-placeholder {
  width: 150px;
  height: 150px;
}

.qr-code-overlay {
  position: absolute;
  top: 24px; /* Adjust based on your padding */
  left: 50%;
  transform: translateX(-50%);
}
</style> 