import { initializeApp } from 'firebase/app'
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc,
  doc,
  query,
  where,
  type DocumentData 
} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import type { Event } from '../types/event'
import type { Booking } from '../stores/events'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export const eventsCollection = collection(db, 'events')
export const bookingsCollection = collection(db, 'bookings')

export const addEvent = async (event: Omit<Event, 'id'>) => {
  try {
    const docRef = await addDoc(eventsCollection, {
      ...event,
      createdAt: new Date()
    })
    return { id: docRef.id, ...event }
  } catch (error) {
    console.error('Error adding event:', error)
    throw error
  }
}

export const getEvents = async (): Promise<Event[]> => {
  try {
    const snapshot = await getDocs(eventsCollection)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Event, 'id'>
    }))
  } catch (error) {
    console.error('Error getting events:', error)
    throw error
  }
}

export const updateEventTickets = async (eventId: string, availableTickets: number) => {
  try {
    const eventRef = doc(db, 'events', eventId)
    await updateDoc(eventRef, { availableTickets })
  } catch (error) {
    console.error('Error updating tickets:', error)
    throw error
  }
}

export const addBooking = async (booking: Omit<Booking, 'id'>) => {
  try {
    console.log('Adding booking to Firebase:', booking)
    const docRef = await addDoc(bookingsCollection, {
      ...booking,
      createdAt: new Date(),
      bookingDate: new Date(booking.bookingDate)
    })
    console.log('Booking added successfully with ID:', docRef.id)
    return { id: docRef.id, ...booking }
  } catch (error) {
    console.error('Error adding booking:', error)
    throw error
  }
}

export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  try {
    console.log('Fetching bookings for user:', userId)
    const q = query(bookingsCollection, where('userId', '==', userId))
    const snapshot = await getDocs(q)
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Booking, 'id'>,
      bookingDate: doc.data().bookingDate.toDate()
    }))
    console.log('Retrieved bookings:', bookings)
    return bookings
  } catch (error) {
    console.error('Error getting user bookings:', error)
    throw error
  }
} 