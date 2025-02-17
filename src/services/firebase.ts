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
  type DocumentData,
  setDoc,
  getDoc,
  deleteDoc
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
export const db = getFirestore(app)
export const auth = getAuth(app)

export const eventsCollection = collection(db, 'events')
export const bookingsCollection = collection(db, 'bookings')
export const usersCollection = collection(db, 'users')

export const addEvent = async (eventData: Omit<Event, 'id'>): Promise<Event> => {
  try {
    const eventsRef = collection(db, 'events')
    const docRef = await addDoc(eventsRef, {
      ...eventData,
      createdAt: new Date()
    })
    
    return {
      id: docRef.id,
      ...eventData
    }
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

export const setUserAsAdmin = async (userId: string, isAdmin: boolean) => {
  const userRef = doc(db, 'users', userId)
  await updateDoc(userRef, {
    isAdmin: isAdmin
  })
}

export const createUserDocument = async (userId: string, data: any) => {
  try {
    const userRef = doc(db, 'users', userId)
    
    // Check if user document already exists
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
      // Create new user document
      await setDoc(userRef, {
        ...data,
        isAdmin: false,
        createdAt: new Date()
      })
    }
    
    return userRef
  } catch (error) {
    console.error('Error creating user document:', error)
    throw error
  }
}

export const getEventById = async (id: string): Promise<Event | null> => {
  try {
    const eventRef = doc(db, 'events', id)
    const eventDoc = await getDoc(eventRef)
    
    if (eventDoc.exists()) {
      return {
        id: eventDoc.id,
        ...eventDoc.data()
      } as Event
    }
    
    return null
  } catch (error) {
    console.error('Error getting event:', error)
    return null
  }
}

export const deleteFirebaseEvent = async (eventId: string) => {
  const eventRef = doc(db, 'events', eventId)
  await deleteDoc(eventRef)
}

export const updateFirebaseEvent = async (eventData: Event) => {
  const eventRef = doc(db, 'events', eventData.id)
  await updateDoc(eventRef, {
    ...eventData,
    updatedAt: new Date()
  })
  return eventData
}

export const getFirebaseBookingById = async (bookingId: string): Promise<Booking | null> => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId)
    const bookingDoc = await getDoc(bookingRef)
    
    if (bookingDoc.exists()) {
      const data = bookingDoc.data()
      return {
        id: bookingDoc.id,
        ...data,
        bookingDate: data.bookingDate.toDate()
      } as Booking
    }
    
    return null
  } catch (error) {
    console.error('Error getting booking:', error)
    throw error
  }
} 