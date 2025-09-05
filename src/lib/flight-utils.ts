import { Flight, FlightSegment, SearchFilters, SortOptions } from '@/types/flight';

// Formatear duración de minutos a horas y minutos
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
}

// Formatear precio con moneda
export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Formatear fecha y hora
export function formatDateTime(dateString: string): {
  date: string;
  time: string;
  dayOfWeek: string;
} {
  const date = new Date(dateString);
  
  return {
    date: date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }),
    time: date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }),
    dayOfWeek: date.toLocaleDateString('es-AR', { weekday: 'short' })
  };
}

// Obtener número de escalas
export function getStopsText(stops: number): string {
  if (stops === 0) return 'Sin escalas';
  if (stops === 1) return '1 escala';
  return `${stops} escalas`;
}

// Determinar momento del día basado en hora
export function getTimeOfDay(timeString: string): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date(timeString).getHours();
  
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening';
}

// Obtener texto del momento del día
export function getTimeOfDayText(timeOfDay: 'morning' | 'afternoon' | 'evening'): string {
  switch (timeOfDay) {
    case 'morning': return 'Mañana (06:00-11:59)';
    case 'afternoon': return 'Tarde (12:00-17:59)';
    case 'evening': return 'Noche (18:00-05:59)';
  }
}

// Filtrar vuelos según criterios
export function filterFlights(flights: Flight[], filters: SearchFilters): Flight[] {
  return flights.filter(flight => {
    // Filtro por precio
    if (filters.minPrice && flight.totalPrice < filters.minPrice) return false;
    if (filters.maxPrice && flight.totalPrice > filters.maxPrice) return false;
    
    // Filtro por aerolíneas
    if (filters.airlines && filters.airlines.length > 0) {
      const flightAirlines = flight.segments.map(s => s.airline.code);
      const hasMatchingAirline = flightAirlines.some(code => filters.airlines!.includes(code));
      if (!hasMatchingAirline) return false;
    }
    
    // Filtro por número de escalas
    if (filters.maxStops !== undefined && flight.stops > filters.maxStops) return false;
    
    // Filtro por duración
    if (filters.maxDuration && flight.totalDuration > filters.maxDuration) return false;
    
    // Filtro por momento del día
    if (filters.timeOfDay && filters.timeOfDay.length > 0) {
      const departureTimeOfDay = getTimeOfDay(flight.segments[0].departureTime);
      if (!filters.timeOfDay.includes(departureTimeOfDay)) return false;
    }
    
    // Filtro por aeropuertos
    if (filters.airports && filters.airports.length > 0) {
      const flightAirports = flight.segments.flatMap(s => [s.departureAirport.code, s.arrivalAirport.code]);
      const hasMatchingAirport = flightAirports.some(code => filters.airports!.includes(code));
      if (!hasMatchingAirport) return false;
    }
    
    return true;
  });
}

// Ordenar vuelos
export function sortFlights(flights: Flight[], sort: SortOptions): Flight[] {
  const sortedFlights = [...flights];
  
  sortedFlights.sort((a, b) => {
    let comparison = 0;
    
    switch (sort.field) {
      case 'price':
        comparison = a.totalPrice - b.totalPrice;
        break;
      case 'duration':
        comparison = a.totalDuration - b.totalDuration;
        break;
      case 'departure':
        comparison = new Date(a.segments[0].departureTime).getTime() - 
                    new Date(b.segments[0].departureTime).getTime();
        break;
      case 'arrival':
        const aArrival = a.segments[a.segments.length - 1].arrivalTime;
        const bArrival = b.segments[b.segments.length - 1].arrivalTime;
        comparison = new Date(aArrival).getTime() - new Date(bArrival).getTime();
        break;
      case 'stops':
        comparison = a.stops - b.stops;
        break;
    }
    
    return sort.direction === 'desc' ? -comparison : comparison;
  });
  
  return sortedFlights;
}

// Obtener rango de precios de una lista de vuelos
export function getPriceRange(flights: Flight[]): { min: number; max: number } {
  if (flights.length === 0) return { min: 0, max: 0 };
  
  const prices = flights.map(f => f.totalPrice);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
}

// Obtener aerolíneas únicas de una lista de vuelos
export function getUniqueAirlines(flights: Flight[]): { code: string; name: string; count: number }[] {
  const airlineMap = new Map<string, { name: string; count: number }>();
  
  flights.forEach(flight => {
    flight.segments.forEach(segment => {
      const { code, name } = segment.airline;
      if (airlineMap.has(code)) {
        airlineMap.get(code)!.count++;
      } else {
        airlineMap.set(code, { name, count: 1 });
      }
    });
  });
  
  return Array.from(airlineMap.entries()).map(([code, data]) => ({
    code,
    name: data.name,
    count: data.count
  })).sort((a, b) => b.count - a.count);
}

// Calcular duración total de un vuelo
export function calculateTotalDuration(segments: FlightSegment[]): number {
  if (segments.length === 0) return 0;
  
  const firstDeparture = new Date(segments[0].departureTime);
  const lastArrival = new Date(segments[segments.length - 1].arrivalTime);
  
  return Math.floor((lastArrival.getTime() - firstDeparture.getTime()) / (1000 * 60));
}

// Obtener el mejor valor (mejor relación precio-duración-escalas)
export function getBestValueScore(flight: Flight): number {
  // Puntuación basada en precio (menor = mejor), duración (menor = mejor) y escalas (menor = mejor)
  const priceScore = 1000 / flight.totalPrice; // Invertido para que menor precio = mayor score
  const durationScore = 1000 / (flight.totalDuration / 60); // Invertido, convertido a horas
  const stopsScore = flight.stops === 0 ? 100 : (flight.stops === 1 ? 50 : 25);
  
  return priceScore + durationScore + stopsScore;
}