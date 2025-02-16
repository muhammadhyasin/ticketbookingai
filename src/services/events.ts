import { getEvents as getFirebaseEvents, updateEventTickets } from './firebase'
import type { Event } from '../types/event'

let events: Event[] = []

export const getEvents = async () => {
  events = await getFirebaseEvents()
  return events
}

export const getEventById = (id: string) => events.find(event => event.id === id)

export const getFeaturedEvents = () => events.filter(event => event.featured)

export const getUpcomingEvents = () => events.filter(event => event.status === 'Upcoming')

export const getEventsByCategory = (category: Event['category']) => 
  events.filter(event => event.category === category)

export const updateAvailableTickets = async (eventId: string, quantity: number) => {
  const event = getEventById(eventId)
  if (!event) throw new Error('Event not found')
  
  const newAvailableTickets = event.availableTickets - quantity
  if (newAvailableTickets < 0) throw new Error('Not enough tickets available')
  
  await updateEventTickets(eventId, newAvailableTickets)
  
  // Update local cache
  const eventIndex = events.findIndex(e => e.id === eventId)
  events[eventIndex] = {
    ...event,
    availableTickets: newAvailableTickets
  }
} 