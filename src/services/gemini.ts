import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GenerativeModel, ChatSession } from '@google/generative-ai';
import { getEvents, getEventById } from './events';
import type { Event } from '../types/event';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Helper function to format event details
const formatEventDetails = (event: Event) => `
╔══════════════════════════════════════════
║ 🎫  ${event.title}
║ 
║ 📅  ${new Date(event.date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}
║ ⏰  ${event.time}
║ 📍  ${event.location}
║ 
║ 💰  Price: $${event.price.toFixed(2)}
║ 🎟️  ${event.availableTickets} tickets available
║ 🏷️  Category: ${event.category}
║ 
║ 📝  ${event.description}
║ 
║ 🆔  ${event.id}
╚══════════════════════════════════════════`;

// Create a chat interface
export const startChat = async (): Promise<ChatSession> => {
  try {
    // Get events first
    const events = await getEvents();
    
    // Then format them
    const allEventsContext = events
      .map(event => formatEventDetails(event))
      .join('\n\n');

    const model = genAI.getGenerativeModel({ model: "gemini-pro" }) as GenerativeModel;
    return await model.startChat({
      history: [
        {
          role: "user",
          parts: `You are an AI event booking assistant. Here are the available events:

${allEventsContext}

Instructions for handling user queries:

1. When users ask about available events or to list events:
   - Respond with exactly "[EVENTS_LIST]" followed by a friendly message asking if they'd like to know more about any specific event
   - Do not list the events in text format

2. When users want to book tickets, ALWAYS respond with EXACTLY this format:
   "📋 Booking Confirmation
━━━━━━━━━━━━━━━━━━━━━

Event: [Event Name]
Date: [Date]
Time: [Time]
Location: [Location]
Price: $[Price]
Quantity: [Number] ticket(s)
Total: $[Total Price]

Would you like to confirm this booking?

{
  "action": "book",
  "eventId": "[event-id]",
  "quantity": [number]
}"

3. When user confirms the booking:
   - Extract the event details from the previous message
   - Send the exact same JSON response again
   - Do not modify the JSON structure or add any text before it

4. For all responses:
   - Be friendly and conversational
   - Keep formatting clean and consistent
   - Use proper line breaks for readability

Remember to always check ticket availability before suggesting bookings.`,
        },
        {
          role: "model",
          parts: `Hello! 👋 I'm your event booking assistant. I can help you:

• 🔍 Browse available events
• ℹ️ Get event details
• 🎫 Book tickets
• 🏷️ Find events by category

What would you like to know about our upcoming events?`,
        },
      ],
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });
  } catch (error) {
    console.error('Error initializing chat:', error);
    throw error;
  }
};