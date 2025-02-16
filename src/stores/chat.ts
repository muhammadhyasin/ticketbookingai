import { defineStore } from 'pinia'
import { ref as vueRef } from 'vue'
import { startChat } from '../services/gemini'
import { useEventStore } from './events'
import { useAuthStore } from './auth'
import type { ChatSession } from '@google/generative-ai'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface BookingAction {
  action: 'book'
  eventId: string
  quantity: number
}

export const useChatStore = defineStore('chat', () => {
  const messages = vueRef<Message[]>([])
  const isLoading = vueRef(false)
  const chatSession = vueRef<ChatSession | null>(null)
  const error = vueRef<string | null>(null)
  
  const eventStore = useEventStore()
  const authStore = useAuthStore()

  // Add payment state
  const showPayment = vueRef(false)
  const pendingBooking = vueRef<{
    eventId: string;
    userId: string;
    quantity: number;
  } | null>(null)

  const handleBookingAction = async (action: BookingAction) => {
    try {
      if (!authStore.isAuthenticated) {
        throw new Error('Please login to book tickets')
      }

      if (!authStore.user?.uid) {
        throw new Error('User ID not found')
      }

      // Store pending booking and show payment modal
      pendingBooking.value = {
        eventId: action.eventId,
        userId: authStore.user.uid,
        quantity: action.quantity
      }
      showPayment.value = true

      // Return message about payment
      return `Great! Let's proceed with the payment for your booking.
      
Please complete the payment process to confirm your tickets.`

    } catch (error) {
      console.error('Error in handleBookingAction:', error)
      throw error
    }
  }

  const completePendingBooking = async () => {
    if (!pendingBooking.value) return

    const booking = await eventStore.createBooking(
      pendingBooking.value.eventId,
      pendingBooking.value.userId,
      pendingBooking.value.quantity
    )

    await eventStore.loadUserBookings(pendingBooking.value.userId)

    // Reset payment state
    showPayment.value = false
    pendingBooking.value = null

    // Add confirmation message with absolute URL
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin
    messages.value.push({
      role: 'assistant',
      content: `🎫 Payment Successful! Booking Confirmed!

Your tickets have been reserved. Here's your digital ticket with QR code:
${baseUrl}/tickets/${booking.id}

Show this QR code at the venue for entry. You can also view your booking details anytime in your dashboard.

Need anything else?`,
      timestamp: new Date()
    })

    // Return the booking ID for navigation
    return booking.id
  }

  const initializeChat = async () => {
    try {
      error.value = null
      chatSession.value = await startChat()
    } catch (err) {
      error.value = 'Failed to initialize chat. Please try again.'
      console.error('Failed to initialize chat:', err)
    }
  }

  const sendMessage = async (content: string) => {
    if (!chatSession.value) {
      await initializeChat()
    }

    if (!chatSession.value) {
      throw new Error('Chat session not initialized')
    }

    try {
      isLoading.value = true
      error.value = null
      
      messages.value.push({
        role: 'user',
        content,
        timestamp: new Date()
      })

      const result = await chatSession.value.sendMessage(content)
      const response = await result.response
      let assistantMessage = response.text()

      console.log('AI Response:', assistantMessage) // Debug log

      // Check if the response is a booking action
      try {
        if (assistantMessage.includes('"action": "book"')) {
          const jsonStartIndex = assistantMessage.indexOf('{')
          const jsonEndIndex = assistantMessage.lastIndexOf('}') + 1
          const jsonStr = assistantMessage.substring(jsonStartIndex, jsonEndIndex)
          
          console.log('Extracted JSON:', jsonStr) // Debug log
          
          const actionData = JSON.parse(jsonStr) as BookingAction
          console.log('Parsed action data:', actionData) // Debug log
          
          if (actionData.action === 'book') {
            assistantMessage = await handleBookingAction(actionData)
          }
        }
      } catch (e) {
        console.error('Error parsing booking action:', e) // Debug log
      }

      messages.value.push({
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date()
      })
    } catch (err: any) {
      console.error('Error in sendMessage:', err) // Debug log
      error.value = err.message
      messages.value.push({
        role: 'assistant',
        content: `Sorry, there was an error: ${err.message}`,
        timestamp: new Date()
      })
    } finally {
      isLoading.value = false
    }
  }

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    initializeChat,
    showPayment,
    pendingBooking,
    completePendingBooking
  }
}) 