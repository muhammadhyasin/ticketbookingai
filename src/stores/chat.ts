import { defineStore } from 'pinia'
import { ref as vueRef, computed } from 'vue'
import { startChat } from '../services/gemini'
import { useEventStore } from './events'
import { useAuthStore } from './auth'
import type { ChatSession } from '@google/generative-ai'
import type { Message, BookingAction } from '../types/chat'

// Update the pendingBooking type
type PendingBooking = {
  eventId: string;
  userId: string;
  quantity: number;
  includeGuide: boolean;
}

const GUIDE_COST = 40 // Add constant for guide cost

export const useChatStore = defineStore('chat', () => {
  const messages = vueRef<Message[]>([])
  const isLoading = vueRef(false)
  const chatSession = vueRef<ChatSession | null>(null)
  const error = vueRef<string | null>(null)
  
  const eventStore = useEventStore()
  const authStore = useAuthStore()

  // Add payment state
  const showPayment = vueRef(false)
  const pendingBooking = vueRef<PendingBooking | null>(null)

  // Update the paymentAmount computed property to include guide cost
  const paymentAmount = computed(() => {
    if (!pendingBooking.value) return 0
    const event = eventStore.events.find(e => e.id === pendingBooking.value.eventId)
    if (!event) return 0
    
    const ticketCost = event.price * pendingBooking.value.quantity
    const guideCost = pendingBooking.value.includeGuide ? GUIDE_COST : 0
    return ticketCost + guideCost
  })

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

      // Set pending booking with initial values
      pendingBooking.value = {
        eventId: action.eventId,
        userId: authStore.user.uid,
        quantity: 0,
        includeGuide: false
      }

      // Ask for ticket quantity first
      return `How many tickets would you like to book for ${event.title}? (Available: ${event.availableTickets})`

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

      // If guide is available, ask if they want one
      if (event.guideAvailable) {
        return `Would you like to add a tour guide for this event? A guide costs an additional $${GUIDE_COST}. (Reply with 'yes' or 'no')`
      } else {
        // If no guide available, proceed to payment
        showPayment.value = true
        return `Great! Let's proceed with booking ${quantity} ticket${quantity > 1 ? 's' : ''} for ${event.title}.
        
Total amount: $${(event.price * quantity).toFixed(2)}

Please complete the payment process to confirm your tickets.`
      }

    } catch (error) {
      console.error('Error in handleTicketQuantity:', error)
      throw error
    }
  }

  // Add new handler for guide response
  const handleGuideResponse = async (content: string) => {
    try {
      if (!pendingBooking.value) {
        throw new Error('No pending booking found')
      }

      const event = eventStore.events.find(e => e.id === pendingBooking.value.eventId)
      if (!event) {
        throw new Error('Event not found')
      }

      const response = content.toLowerCase()
      if (response !== 'yes' && response !== 'no') {
        return "Please reply with 'yes' or 'no' to add a tour guide."
      }

      pendingBooking.value.includeGuide = response === 'yes'
      showPayment.value = true

      const baseAmount = event.price * pendingBooking.value.quantity
      const guideAmount = pendingBooking.value.includeGuide ? GUIDE_COST : 0
      const totalAmount = baseAmount + guideAmount

      const guideMessage = pendingBooking.value.includeGuide ? ' (including tour guide)' : ''
      return `Great! Let's proceed with booking ${pendingBooking.value.quantity} ticket${pendingBooking.value.quantity > 1 ? 's' : ''} for ${event.title}${guideMessage}.
      
Ticket${pendingBooking.value.quantity > 1 ? 's' : ''}: $${baseAmount.toFixed(2)}
${pendingBooking.value.includeGuide ? `Guide: $${GUIDE_COST.toFixed(2)}` : ''}
Total amount: $${totalAmount.toFixed(2)}

Please complete the payment process to confirm your tickets.`

    } catch (error) {
      console.error('Error handling guide response:', error)
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

      // If waiting for guide response
      const event = eventStore.events.find(e => e.id === pendingBooking.value?.eventId)
      if (pendingBooking.value && event?.guideAvailable && pendingBooking.value.quantity > 0 && !showPayment.value) {
        return await handleGuideResponse(content)
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
      pendingBooking.value.quantity,
      pendingBooking.value.includeGuide  // Pass the guide preference
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
    processMessage,
    handleGuideResponse,
    paymentAmount
  }
}) 