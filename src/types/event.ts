export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: number;
  category: string;
  image: string;
  availableTickets: number;
  status: 'active' | 'past';
  guideAvailable: boolean;
  // ... any other fields you need
} 