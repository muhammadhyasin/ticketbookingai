import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getEvents as getFirebaseEvents, updateEventTickets, addBooking, getUserBookings } from '../services/firebase'
import type { Event } from '../types/event'

export interface Booking {
  id: string;
  eventId: string;
  userId: string;
  quantity: number;
  totalPrice: number;
  bookingDate: Date;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
}

export const useEventStore = defineStore('events', () => {
  const events = ref<Event[]>([])
  const bookings = ref<Booking[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Load events
  const loadEvents = async () => {
    try {
      loading.value = true
      error.value = null
      events.value = await getFirebaseEvents()
    } catch (err: any) {
      error.value = err.message
      console.error('Error loading events:', err)
    } finally {
      loading.value = false
    }
  }

  // Initialize events
  loadEvents()

  const userBookings = computed(() => (userId: string) => 
    bookings.value.filter(booking => booking.userId === userId)
  )

  // Load user's bookings
  const loadUserBookings = async (userId: string) => {
    try {
      loading.value = true
      error.value = null
      bookings.value = await getUserBookings(userId)
    } catch (err: any) {
      error.value = err.message
      console.error('Error loading bookings:', err)
    } finally {
      loading.value = false
    }
  }

  const createBooking = async (eventId: string, userId: string, quantity: number) => {
    try {
      loading.value = true
      error.value = null

      console.log('Creating booking...', { eventId, userId, quantity }) // Debug log

      const event = events.value.find(e => e.id === eventId)
      if (!event) throw new Error('Event not found')
      if (event.availableTickets < quantity) throw new Error('Not enough tickets available')

      const bookingData: Omit<Booking, 'id'> = {
        eventId,
        userId,
        quantity,
        totalPrice: event.price * quantity,
        bookingDate: new Date(),
        status: 'Confirmed'
      }

      console.log('Booking data prepared:', bookingData) // Debug log

      // Add to Firebase
      const newBooking = await addBooking(bookingData)
      console.log('Booking added to Firebase:', newBooking) // Debug log

      // Update available tickets
      await updateEventTickets(eventId, event.availableTickets - quantity)
      console.log('Tickets updated in Firebase') // Debug log
      
      // Update local state
      const eventIndex = events.value.findIndex(e => e.id === eventId)
      events.value[eventIndex] = {
        ...event,
        availableTickets: event.availableTickets - quantity
      }

      bookings.value.push(newBooking)
      return newBooking
    } catch (err: any) {
      console.error('Error in createBooking:', err) // Debug log
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const cancelBooking = async (bookingId: string) => {
    try {
      loading.value = true
      error.value = null

      const bookingIndex = bookings.value.findIndex(b => b.id === bookingId)
      if (bookingIndex === -1) throw new Error('Booking not found')

      const booking = bookings.value[bookingIndex]
      const event = events.value.find(e => e.id === booking.eventId)
      if (!event) throw new Error('Event not found')

      // Update booking status
      bookings.value[bookingIndex] = {
        ...booking,
        status: 'Cancelled'
      }

      // Restore available tickets
      await updateEventTickets(booking.eventId, event.availableTickets + booking.quantity)

      // Update local state
      const eventIndex = events.value.findIndex(e => e.id === booking.eventId)
      events.value[eventIndex] = {
        ...event,
        availableTickets: event.availableTickets + booking.quantity
      }

      return bookings.value[bookingIndex]
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Add computed properties for stats
  const activeTickets = computed(() => {
    const now = new Date()
    return bookings.value
      .filter(booking => 
        booking.status === 'Confirmed' &&
        events.value.find(e => 
          e.id === booking.eventId && 
          new Date(e.date) >= now
        )
      )
      .reduce((total, booking) => total + booking.quantity, 0)
  })

  const pastEvents = computed(() => {
    const now = new Date()
    return bookings.value
      .filter(booking => 
        booking.status === 'Confirmed' &&
        events.value.find(e => 
          e.id === booking.eventId && 
          new Date(e.date) < now
        )
      ).length
  })

  const totalSpent = computed(() => {
    return bookings.value
      .filter(booking => booking.status === 'Confirmed')
      .reduce((total, booking) => total + booking.totalPrice, 0)
  })

  return {
    events,
    bookings,
    loading,
    error,
    loadEvents,
    userBookings,
    createBooking,
    cancelBooking,
    loadUserBookings,
    activeTickets,
    pastEvents,
    totalSpent
  }
}) 