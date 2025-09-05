import { Flight, SearchParams, SearchResponse, AIRPORTS, AIRLINES } from '@/types/flight';

// Simulación de datos mock realistas para desarrollo
function generateMockFlights(searchParams: SearchParams): Flight[] {
  const flights: Flight[] = [];
  
  // Datos base para generar vuelos realistas
  const airlines = AIRLINES;
  const basePrice = 800;
  const priceVariation = 1700; // Rango $800-$2500
  
  // Generar diferentes tipos de vuelos
  const flightConfigs = [
    // Vuelos directos (premium)
    {
      stops: 0,
      airlines: ['AA', 'AR'],
      duration: [600, 660], // 10-11 horas
      priceMultiplier: 1.5,
      count: 3
    },
    // Vuelos con 1 escala
    {
      stops: 1,
      airlines: ['AA', 'LA', 'UA', 'DL'],
      duration: [720, 900], // 12-15 horas
      priceMultiplier: 1.0,
      count: 8
    },
    // Vuelos con 2 escalas (económicos)
    {
      stops: 2,
      airlines: ['CM', 'AV', 'LA'],
      duration: [900, 1200], // 15-20 horas
      priceMultiplier: 0.7,
      count: 4
    }
  ];

  let flightId = 1;
  
  flightConfigs.forEach(config => {
    for (let i = 0; i < config.count; i++) {
      const airline = airlines.find(a => a.code === config.airlines[Math.floor(Math.random() * config.airlines.length)])!;
      const duration = config.duration[0] + Math.random() * (config.duration[1] - config.duration[0]);
      const price = Math.floor((basePrice + Math.random() * priceVariation) * config.priceMultiplier);
      
      // Generar horarios realistas
      const departureHour = 6 + Math.random() * 18; // Entre 6:00 AM y 12:00 AM
      const departureDate = new Date(searchParams.departureDate);
      departureDate.setHours(Math.floor(departureHour), Math.floor(Math.random() * 60));
      
      const segments = generateSegments(
        searchParams.origin,
        searchParams.destination,
        departureDate,
        config.stops,
        airline,
        duration
      );

      const flight: Flight = {
        id: `FL${flightId.toString().padStart(3, '0')}`,
        segments,
        totalDuration: Math.floor(duration),
        totalPrice: price,
        currency: 'USD',
        stops: config.stops,
        baggage: {
          carryOn: true,
          checked: searchParams.class === 'economy' ? 23 : 32
        },
        cancellationPolicy: price > 1500 ? 'Flexible' : 'Restrictive',
        changePolicy: price > 1200 ? 'Free changes' : 'Change fee applies',
        deepLink: `https://booking.example.com/flight/${flightId}`,
        lastUpdated: new Date().toISOString()
      };

      flights.push(flight);
      flightId++;
    }
  });

  return flights;
}

function generateSegments(
  origin: string,
  destination: string,
  departureDate: Date,
  stops: number,
  airline: typeof AIRLINES[number],
  totalDuration: number
) {
  const segments = [];
  
  // Aeropuertos de conexión comunes para vuelos EZE/AEP -> MIA
  const connectionHubs = [
    { code: 'PTY', name: 'Tocumen International Airport', city: 'Panama City', country: 'Panama' },
    { code: 'BOG', name: 'El Dorado International Airport', city: 'Bogotá', country: 'Colombia' },
    { code: 'LIM', name: 'Jorge Chávez International Airport', city: 'Lima', country: 'Peru' },
    { code: 'SCL', name: 'Arturo Merino Benítez International Airport', city: 'Santiago', country: 'Chile' },
    { code: 'GRU', name: 'São Paulo–Guarulhos International Airport', city: 'São Paulo', country: 'Brazil' }
  ];

  let currentOrigin = origin;
  let currentDeparture = new Date(departureDate);
  let remainingDuration = totalDuration;

  for (let i = 0; i <= stops; i++) {
    const isLastSegment = i === stops;
    const currentDestination = isLastSegment ? destination : connectionHubs[i % connectionHubs.length].code;
    
    // Duración del segmento (distribución realista)
    const segmentDuration = isLastSegment 
      ? remainingDuration 
      : Math.floor(remainingDuration / (stops - i + 1)) + Math.random() * 60 - 30;
    
    const arrivalTime = new Date(currentDeparture);
    arrivalTime.setMinutes(arrivalTime.getMinutes() + segmentDuration);

    const segment = {
      id: `SEG${i + 1}`,
      departureAirport: getAirportInfo(currentOrigin),
      arrivalAirport: getAirportInfo(currentDestination),
      departureTime: currentDeparture.toISOString(),
      arrivalTime: arrivalTime.toISOString(),
      airline: airline,
      flightNumber: `${airline.code}${Math.floor(1000 + Math.random() * 8999)}`,
      aircraft: getRandomAircraft(),
      duration: Math.floor(segmentDuration),
      class: 'economy' as const
    };

    segments.push(segment);

    // Preparar para siguiente segmento
    if (!isLastSegment) {
      currentOrigin = currentDestination;
      // Tiempo de conexión (1-3 horas)
      currentDeparture = new Date(arrivalTime);
      currentDeparture.setMinutes(currentDeparture.getMinutes() + 60 + Math.random() * 120);
      remainingDuration -= segmentDuration;
    }
  }

  return segments;
}

function getAirportInfo(code: string) {
  // Buscar en aeropuertos conocidos
  const allAirports = [...AIRPORTS.BUENOS_AIRES, ...AIRPORTS.MIAMI];
  let airport = allAirports.find(a => a.code === code);
  
  if (!airport) {
    // Datos de aeropuertos de conexión
    const connectionAirports = {
      'PTY': { code: 'PTY', name: 'Tocumen International Airport', city: 'Panama City', country: 'Panama' },
      'BOG': { code: 'BOG', name: 'El Dorado International Airport', city: 'Bogotá', country: 'Colombia' },
      'LIM': { code: 'LIM', name: 'Jorge Chávez International Airport', city: 'Lima', country: 'Peru' },
      'SCL': { code: 'SCL', name: 'Arturo Merino Benítez International Airport', city: 'Santiago', country: 'Chile' },
      'GRU': { code: 'GRU', name: 'São Paulo–Guarulhos International Airport', city: 'São Paulo', country: 'Brazil' }
    };
    
    airport = connectionAirports[code as keyof typeof connectionAirports];
  }

  return airport || { code, name: `${code} Airport`, city: 'Unknown', country: 'Unknown' };
}

function getRandomAircraft(): string {
  const aircraft = [
    'Boeing 737-800',
    'Boeing 787-9',
    'Airbus A330-200',
    'Airbus A320-200',
    'Boeing 777-200',
    'Embraer E190'
  ];
  
  return aircraft[Math.floor(Math.random() * aircraft.length)];
}

// Función principal para buscar vuelos
export async function searchFlights(searchParams: SearchParams): Promise<SearchResponse> {
  // Simular delay de API real
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // En producción, aquí haríamos la llamada real a la API
  // const response = await fetch('https://api.amadeus.com/v2/shopping/flight-offers', {...});
  
  const flights = generateMockFlights(searchParams);
  
  return {
    flights,
    searchId: `SEARCH_${Date.now()}`,
    totalResults: flights.length,
    searchParams,
    filters: {}
  };
}

// Función para obtener detalles específicos de un vuelo
export async function getFlightDetails(flightId: string): Promise<Flight | null> {
  // Simular delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // En desarrollo, simular búsqueda en datos mock
  // En producción, llamada específica a API
  const mockSearchParams: SearchParams = {
    origin: 'EZE',
    destination: 'MIA',
    departureDate: new Date().toISOString().split('T')[0],
    passengers: { adults: 1, children: 0, infants: 0 },
    class: 'economy',
    tripType: 'one-way'
  };
  
  const searchResponse = await searchFlights(mockSearchParams);
  return searchResponse.flights.find(f => f.id === flightId) || null;
}

// Función para validar parámetros de búsqueda
export function validateSearchParams(params: Partial<SearchParams>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!params.origin) errors.push('Origen es requerido');
  if (!params.destination) errors.push('Destino es requerido');
  if (!params.departureDate) errors.push('Fecha de salida es requerida');
  if (!params.passengers?.adults || params.passengers.adults < 1) {
    errors.push('Al menos 1 pasajero adulto es requerido');
  }
  
  // Validar fecha futura
  if (params.departureDate && new Date(params.departureDate) < new Date()) {
    errors.push('La fecha de salida debe ser futura');
  }
  
  // Validar fecha de retorno si es ida y vuelta
  if (params.tripType === 'round-trip' && !params.returnDate) {
    errors.push('Fecha de retorno es requerida para viajes de ida y vuelta');
  }
  
  if (params.returnDate && params.departureDate && 
      new Date(params.returnDate) <= new Date(params.departureDate)) {
    errors.push('La fecha de retorno debe ser posterior a la fecha de salida');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}