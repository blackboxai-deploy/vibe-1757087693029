import { NextRequest, NextResponse } from 'next/server';
import { getFlightDetails } from '@/lib/flight-api';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const flightId = params.id;
    
    if (!flightId) {
      return NextResponse.json(
        { error: 'ID de vuelo requerido' },
        { status: 400 }
      );
    }

    const flight = await getFlightDetails(flightId);
    
    if (!flight) {
      return NextResponse.json(
        { error: 'Vuelo no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(flight, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=600', // Cache por 10 minutos
      }
    });

  } catch (error) {
    console.error('Error obteniendo detalles del vuelo:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: 'No se pudieron obtener los detalles del vuelo'
      },
      { status: 500 }
    );
  }
}