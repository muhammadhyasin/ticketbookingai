<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, computed } from 'vue'
import { useChatStore } from '../../stores/chat'
import { useRouter } from 'vue-router'
import { useEventStore } from '../../stores/events'
import PaymentModal from '../payment/PaymentModal.vue'
import type { Event } from '../../types/event'

const router = useRouter()
const chatStore = useChatStore()
const eventStore = useEventStore()
const newMessage = ref('')
const chatContainer = ref<HTMLElement | null>(null)

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const sendMessage = async (content?: string) => {
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

// Add viewport height management for mobile
const adjustHeight = () => {
  const vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}

const goToDashboard = () => {
  router.push('/dashboard')
}

const isEventListing = (message: string) => {
  return message.includes('[EVENTS_LIST]')
}

const getEventsForListing = () => {
  return eventStore.events
}

// Add payment-related code
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

// Add booking message formatter
const formatBookingMessage = (content: string) => {
  const jsonStartIndex = content.indexOf('{')
  if (jsonStartIndex === -1) return content
  return content.substring(0, jsonStartIndex).trim()
}

onMounted(() => {
  chatStore.initializeChat()
  adjustHeight()
  window.addEventListener('resize', adjustHeight)
})

onUnmounted(() => {
  window.removeEventListener('resize', adjustHeight)
})
</script>

<template>
  <div class="mobile-chat">
    <!-- Modern Chat Header -->
    <header class="chat-header">
      <div class="header-content">
        <button @click="goToDashboard" class="back-button">
          <i class="bi bi-arrow-left"></i>
        </button>
        
        <div class="assistant-info">
          <div class="avatar">
            <i class="bi bi-robot"></i>
          </div>
          <div class="info">
            <h6 class="title">AI Assistant</h6>
            <span class="status">
              <span class="status-dot"></span>
              Online
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Chat Messages -->
    <main 
      ref="chatContainer"
      class="chat-messages"
    >
      <div v-if="!chatStore.messages.length" class="empty-chat">
        <i class="bi bi-chat-dots mb-2"></i>
        <p>Start a conversation with our AI assistant!</p>
      </div>

      <template v-for="(message, index) in chatStore.messages" :key="index">
        <div 
          :class="[
            'message',
            message.role === 'user' ? 'message-user' : 'message-assistant'
          ]"
        >
          <div class="message-bubble">
            <div class="message-text">
              {{ message.content.replace('[EVENTS_LIST]', '') }}
              
              <!-- Event Quick Actions -->
              <div v-if="message.role === 'assistant' && isEventListing(message.content)" 
                   class="event-cards">
                <div v-for="event in getEventsForListing()" 
                     :key="event.id" 
                     class="event-card"
                >
                  <div class="event-header">
                    <h6>{{ event.title }}</h6>
                    <span class="event-badge">{{ event.category }}</span>
                  </div>
                  
                  <div class="event-details">
                    <span>
                      <i class="bi bi-calendar3 me-1"></i>
                      {{ new Date(event.date).toLocaleDateString() }}
                    </span>
                    <span>
                      <i class="bi bi-ticket-perforated me-1"></i>
                      {{ event.availableTickets }} left
                    </span>
                  </div>
                  
                  <div class="event-actions">
                    <button 
                      @click="sendMessage(`Tell me more about ${event.title}`)"
                      class="action-button info"
                    >
                      <i class="bi bi-info-circle"></i>
                      Details
                    </button>
                    <button 
                      @click="sendMessage(`I want to book  ticket for ${event.title}`)"
                      class="action-button book"
                    >
                      <i class="bi bi-ticket"></i>
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <time class="message-time">{{ formatTime(message.timestamp) }}</time>
          </div>
        </div>
      </template>

      <!-- Loading Indicator -->
      <div v-if="chatStore.isLoading" class="message message-assistant">
        <div class="message-bubble loading">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </main>

    <!-- Chat Input -->
    <footer class="chat-input">
      <div class="input-container">
        <form @submit.prevent="sendMessage()" class="input-form">
          <input
            v-model="newMessage"
            type="text"
            placeholder="Type your message..."
            :disabled="chatStore.isLoading"
          >
          <button 
            type="submit" 
            :disabled="!newMessage.trim() || chatStore.isLoading"
            class="send-button"
          >
            <i class="bi bi-send-fill"></i>
          </button>
        </form>
      </div>
    </footer>

    <!-- Add back the payment modal -->
    <PaymentModal
      :show="chatStore.showPayment"
      :amount="paymentAmount"
      @success="handlePaymentSuccess"
      @cancel="chatStore.showPayment = false"
    />
  </div>
</template>

<style scoped>
.mobile-chat {
  display: flex;
  flex-direction: column;
  height: calc(var(--vh, 1vh) * 100);
  background: #f8f9fa;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.chat-header {
  padding: 0.75rem;
  background: white;
  color: #1a1a1a;
  border-bottom: 1px solid #eaeaea;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 768px;
  margin: 0 auto;
  width: 100%;
}

.back-button {
  width: 2rem;
  height: 2rem;
  border: none;
  background: transparent;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  padding: 0;
  transition: all 0.2s ease;
}

.back-button:hover {
  color: #0d6efd;
  transform: translateX(-2px);
}

.assistant-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.avatar {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #0d6efd, #0099ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  box-shadow: 0 2px 6px rgba(13, 110, 253, 0.2);
}

.info {
  display: flex;
  flex-direction: column;
}

.title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.status {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: #666;
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  background: #22c55e;
  border-radius: 50%;
  display: block;
  position: relative;
}

.status-dot::after {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse 2s infinite;
  opacity: 0.5;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(2);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: #f8f9fa;
}

.empty-chat {
  text-align: center;
  color: #6c757d;
  padding: 2rem 1rem;
}

.empty-chat i {
  font-size: 2.5rem;
  display: block;
}

.message {
  display: flex;
  margin-bottom: 0.5rem;
}

.message-user {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 85%;
  padding: 0.875rem 1rem;
  border-radius: 1.25rem;
  position: relative;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.message-user .message-bubble {
  background: linear-gradient(135deg, #0d6efd, #0099ff);
  color: white;
  border-bottom-right-radius: 0.375rem;
}

.message-assistant .message-bubble {
  background: white;
  color: #1a1a1a;
  border-bottom-left-radius: 0.375rem;
}

.message-time {
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 0.25rem;
  display: block;
}

.message-user .message-time {
  color: rgba(255,255,255,0.7);
}

.chat-input {
  padding: 0.75rem 1rem;
  background: white;
  border-top: 1px solid #eaeaea;
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.input-container {
  max-width: 768px;
  margin: 0 auto;
  width: 100%;
}

.input-form {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  background: #f8f9fa;
  padding: 0.5rem;
  border-radius: 1.75rem;
  border: 1px solid #eaeaea;
}

.input-form input {
  flex: 1;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 1.5rem;
  background: transparent;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
  min-width: 0;
}

.input-form input:focus {
  outline: none;
  background: transparent;
  box-shadow: none;
}

.send-button {
  width: 2.75rem;
  height: 2.75rem;
  min-width: 2.75rem;
  border-radius: 50%;
  border: none;
  background: #0d6efd;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s ease;
  margin-left: auto;
}

.send-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.send-button:not(:disabled):hover {
  background: #0b5ed7;
  transform: scale(1.05);
}

.typing-dots {
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem;
}

.typing-dots span {
  width: 0.5rem;
  height: 0.5rem;
  background: #6c757d;
  border-radius: 50%;
  animation: bounce 1s infinite;
}

.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

/* Hide scrollbar but keep functionality */
.chat-messages {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.chat-messages::-webkit-scrollbar {
  display: none;
}

/* Mobile-specific styles */
@media (max-width: 768px) {
  .message-bubble {
    max-width: 90%;
  }

  .chat-header {
    padding: 0.75rem 1rem;
  }

  .chat-input {
    padding: 0.625rem 0.75rem;
  }

  .input-form {
    padding: 0.375rem;
  }

  .input-form input {
    padding: 0.625rem 1rem;
  }

  .send-button {
    width: 2.5rem;
    height: 2.5rem;
    min-width: 2.5rem;
  }
}

/* Event Cards Styling */
.event-cards {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.event-card {
  background: white;
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border: 1px solid #eaeaea;
  transition: transform 0.2s ease;
}

.event-card:hover {
  transform: translateY(-2px);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.event-header h6 {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a1a;
}

.event-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  background: #f0f7ff;
  color: #0d6efd;
  border-radius: 1rem;
  font-weight: 500;
}

.event-details {
  display: flex;
  gap: 1rem;
  font-size: 0.8125rem;
  color: #666;
  margin-bottom: 1rem;
}

.event-details i {
  color: #0d6efd;
}

.event-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.action-button.info {
  background: #f8f9fa;
  color: #1a1a1a;
}

.action-button.info:hover {
  background: #e9ecef;
}

.action-button.book {
  background: #0d6efd;
  color: white;
}

.action-button.book:hover {
  background: #0b5ed7;
}

/* Adjust message bubble for events list */
.message-bubble {
  max-width: 85%;
  padding: 0.875rem 1rem;
}

.message-assistant .message-bubble:has(.event-cards) {
  max-width: 100%;
  width: 100%;
  background: transparent;
  box-shadow: none;
  padding: 0;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .event-card {
    padding: 0.875rem;
  }
  
  .event-actions {
    flex-direction: row;
  }
  
  .action-button {
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
  }
}

/* Add payment modal styles */
:deep(.payment-modal) {
  z-index: 1100; /* Ensure modal appears above chat interface */
}

/* Add booking confirmation styles */
.booking-confirmation {
  font-family: inherit;
  white-space: pre-line;
  margin: 0;
  padding: 0;
  background: none;
  border: none;
  color: inherit;
}

.booking-confirmation-wrapper {
  background: white;
  border-radius: 1rem;
  padding: 1rem;
  margin-top: 0.5rem;
  border: 1px solid #eaeaea;
}
</style> 