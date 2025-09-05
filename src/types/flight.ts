// Flight Search Application Types - Complete TypeScript Definitions

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface Airline {
  code: string;
  name: string;
  logo?: string;
}

export interface FlightSegment {
  id: string;
  airline: Airline;
  flightNumber: string;
  departure: {
    airport: Airport;
    time: string;
    terminal?: string;
  };
  arrival: {
    airport: Airport;
    time: string;
    terminal?: string;
  };
  duration: number; // in minutes
  aircraft: string;
}

export interface Flight {
  id: string;
  segments: FlightSegment[];
  price: {
    total: number;
    currency: string;
    breakdown?: {
      base: number;
      taxes: number;
      fees: number;
    };
  };
  duration: number; // total duration in minutes
  stops: number;
  layovers?: Array<{
    airport: Airport;
    duration: number; // in minutes
  }>;
  baggage: {
    carry: string;
    checked: string;
  };
  amenities: string[];
  bookingClass: 'economy' | 'business' | 'first';
  isRefundable: boolean;
  lastTicketingDate?: string;
  availableSeats: number;
}

export interface SearchParams {
  from: string; // airport code
  to: string; // airport code
  departureDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  cabinClass: 'economy' | 'business' | 'first';
  tripType: 'roundtrip' | 'oneway';
}

export interface FilterOptions {
  priceRange: {
    min: number;
    max: number;
  };
  airlines: string[];
  maxStops: number;
  departureTime: {
    min: string; // HH:mm format
    max: string; // HH:mm format
  };
  duration: {
    min: number; // in minutes
    max: number; // in minutes
  };
  airports: string[];
}

export interface SearchResponse {
  flights: Flight[];
  total: number;
  searchId: string;
  filters: {
    priceRange: { min: number; max: number };
    airlines: Airline[];
    maxDuration: number;
    minDuration: number;
  };
}

export interface FlightComparison {
  flights: Flight[];
  criteria: Array<'price' | 'duration' | 'stops' | 'departure' | 'arrival'>;
}

// Utility types
export type SortOption = 'price' | 'duration' | 'departure' | 'arrival' | 'best';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

// Form validation schemas will use these interfaces
export interface SearchFormData extends SearchParams {}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Static airport data
export const AIRPORTS = {
  BUENOS_AIRES: [
    {
      code: 'EZE',
      name: 'Aeroporto Internacional Ministro Pistarini',
      city: 'Buenos Aires',
      country: 'Argentina'
    },
    {
      code: 'AEP',
      name: 'Aeropuerto Jorge Newbery',
      city: 'Buenos Aires', 
      country: 'Argentina'
    }
  ],
  MIAMI: [
    {
      code: 'MIA',
      name: 'Miami International Airport',
      city: 'Miami',
      country: 'United States'
    }
  ]
} as const;

// Static airline data
export const AIRLINES = [
  { code: 'AR', name: 'Aerolíneas Argentinas' },
  { code: 'AA', name: 'American Airlines' },
  { code: 'LA', name: 'LATAM Airlines' },
  { code: 'UA', name: 'United Airlines' },
  { code: 'DL', name: 'Delta Air Lines' },
  { code: 'CM', name: 'Copa Airlines' },
  { code: 'AV', name: 'Avianca' },
  { code: 'G3', name: 'Gol Linhas Aéreas' },
  { code: 'JJ', name: 'TAM Linhas Aéreas' }
] as const;

// Time ranges for filtering
export const TIME_RANGES = {
  morning: { start: '06:00', end: '11:59' },
  afternoon: { start: '12:00', end: '17:59' },
  evening: { start: '18:00', end: '23:59' },
  night: { start: '00:00', end: '05:59' }
} as const;

// Common amenities
export const AMENITIES = [
  'WiFi',
  'Meals',
  'Entertainment',
  'Power Outlets',
  'Priority Boarding',
  'Extra Legroom',
  'Drinks',
  'Blanket & Pillow'
] as const;