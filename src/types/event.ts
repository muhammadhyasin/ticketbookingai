export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: number;
  category: 'Music' | 'Sports' | 'Technology' | 'Arts' | 'Food';
  image: string;
  capacity: number;
  availableTickets: number;
  status: 'Upcoming' | 'Live' | 'Ended';
  featured: boolean;
} 