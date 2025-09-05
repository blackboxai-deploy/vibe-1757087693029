import { NextRequest, NextResponse } from 'next/server';
import { searchFlights, validateSearchParams } from '@/lib/flight-api';
import { SearchParams } from '@/types/flight';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar parámetros de búsqueda
    const validation = validateSearchParams(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Parámetros inválidos', 
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    const searchParams: SearchParams = {
      origin: body.origin,
      destination: body.destination,
      departureDate: body.departureDate,
      returnDate: body.returnDate,
      passengers: {
        adults: body.passengers?.adults || 1,
        children: body.passengers?.children || 0,
        infants: body.passengers?.infants || 0
      },
      class: body.class || 'economy',
      tripType: body.tripType || 'one-way'
    };

    // Realizar búsqueda
    const searchResponse = await searchFlights(searchParams);

    return NextResponse.json(searchResponse, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache por 5 minutos
      }
    });

  } catch (error) {
    console.error('Error en búsqueda de vuelos:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: 'No se pudo realizar la búsqueda de vuelos'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  try {
    const params: SearchParams = {
      origin: searchParams.get('origin') || 'EZE',
      destination: searchParams.get('destination') || 'MIA',
      departureDate: searchParams.get('departureDate') || new Date().toISOString().split('T')[0],
      returnDate: searchParams.get('returnDate') || undefined,
      passengers: {
        adults: parseInt(searchParams.get('adults') || '1'),
        children: parseInt(searchParams.get('children') || '0'),
        infants: parseInt(searchParams.get('infants') || '0')
      },
      class: (searchParams.get('class') as 'economy' | 'business' | 'first') || 'economy',
      tripType: (searchParams.get('tripType') as 'one-way' | 'round-trip') || 'one-way'
    };

    // Validar parámetros
    const validation = validateSearchParams(params);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Parámetros inválidos', 
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    const searchResponse = await searchFlights(params);

    return NextResponse.json(searchResponse, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300',
      }
    });

  } catch (error) {
    console.error('Error en búsqueda de vuelos (GET):', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: 'No se pudo realizar la búsqueda de vuelos'
      },
      { status: 500 }
    );
  }
}