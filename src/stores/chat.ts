import { defineStore } from 'pinia'
import { ref as vueRef, computed } from 'vue'
import { startChat } from '../services/gemini'
import { useEventStore } from './events'
import { useAuthStore } from './auth'
import type { ChatSession } from '@google/generative-ai'
import type { Message, BookingAction } from '../types/chat'

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

      const event = eventStore.events.find(e => e.id === action.eventId)
      if (!event) {
        throw new Error('Event not found')
      }

      // Ask for ticket quantity first
      const response = `How many tickets would you like to book for ${event.title}? (Available: ${event.availableTickets})`
      
      // Set pending booking with quantity as 0 to indicate waiting for quantity
      pendingBooking.value = {
        eventId: action.eventId,
        userId: authStore.user.uid,
        quantity: 0
      }

      return response

    } catch (error) {
      console.error('Error in handleBookingAction:', error)
      throw error
    }
  }

  const handleTicketQuantity = async (quantity: number) => {
    try {
      if (!pendingBooking.value) {
        throw new Error('No pending booking found')
      }

      const event = eventStore.events.find(e => e.id === pendingBooking.value.eventId)
      if (!event) {
        throw new Error('Event not found')
      }

      // Validate quantity
      if (quantity <= 0) {
        return 'Please enter a valid number of tickets (greater than 0)'
      }

      if (quantity > event.availableTickets) {
        return `Sorry, only ${event.availableTickets} tickets are available. Please choose a smaller quantity.`
      }

      // Update pending booking with quantity
      pendingBooking.value.quantity = quantity
      showPayment.value = true

      return `Great! Let's proceed with booking ${quantity} ticket${quantity > 1 ? 's' : ''} for ${event.title}.
      
Total amount: $${(event.price * quantity).toFixed(2)}

Please complete the payment process to confirm your tickets.`

    } catch (error) {
      console.error('Error in handleTicketQuantity:', error)
      throw error
    }
  }

  const processMessage = async (content: string) => {
    try {
      // If waiting for ticket quantity
      if (pendingBooking.value && pendingBooking.value.quantity === 0) {
        const quantity = parseInt(content)
        if (isNaN(quantity)) {
          return 'Please enter a valid number for ticket quantity.'
        }
        const response = await handleTicketQuantity(quantity)
        return response
      }

      // If not waiting for quantity, process normally
      if (!chatSession.value) {
        await initializeChat()
      }

      if (!chatSession.value) {
        throw new Error('Chat session not initialized')
      }

      const result = await chatSession.value.sendMessage(content)
      const response = await result.response
      let assistantMessage = response.text()

      // Check if the response is a booking action
      try {
        if (assistantMessage.includes('"action": "book"')) {
          const jsonStartIndex = assistantMessage.indexOf('{')
          const jsonEndIndex = assistantMessage.lastIndexOf('}') + 1
          const jsonStr = assistantMessage.substring(jsonStartIndex, jsonEndIndex)
          const actionData = JSON.parse(jsonStr) as BookingAction
          
          if (actionData.action === 'book') {
            assistantMessage = await handleBookingAction(actionData)
          }
        }
      } catch (e) {
        console.error('Error parsing booking action:', e)
      }

      return assistantMessage
    } catch (error) {
      console.error('Error processing message:', error)
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
    try {
      isLoading.value = true
      error.value = null
      
      messages.value.push({
        role: 'user',
        content,
        timestamp: new Date()
      })

      const assistantMessage = await processMessage(content)

      // Only add assistant message if it's not null
      if (assistantMessage) {
        messages.value.push({
          role: 'assistant',
          content: assistantMessage,
          timestamp: new Date()
        })
      }
    } catch (err: any) {
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
    completePendingBooking,
    handleBookingAction,
    handleTicketQuantity,
    processMessage
  }
}) 