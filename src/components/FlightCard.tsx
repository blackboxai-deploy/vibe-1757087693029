'use client';

import { Flight } from '@/types/flight';
import { formatDuration, formatPrice, formatDateTime, getStopsText } from '@/lib/flight-utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface FlightCardProps {
  flight: Flight;
  onSelect?: (flight: Flight) => void;
  onCompare?: (flight: Flight) => void;
  isSelected?: boolean;
  showCompareButton?: boolean;
}

export function FlightCard({ 
  flight, 
  onSelect, 
  onCompare, 
  isSelected = false, 
  showCompareButton = false 
}: FlightCardProps) {
  const firstSegment = flight.segments[0];
  const lastSegment = flight.segments[flight.segments.length - 1];
  
  const departureInfo = formatDateTime(firstSegment.departureTime);
  const arrivalInfo = formatDateTime(lastSegment.arrivalTime);
  
  const handleSelect = () => {
    onSelect?.(flight);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCompare?.(flight);
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={handleSelect}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-lg font-semibold">
              {firstSegment.airline.name}
            </div>
            <Badge variant="secondary" className="text-xs">
              {firstSegment.airline.code}-{firstSegment.flightNumber}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(flight.totalPrice, flight.currency)}
            </div>
            <div className="text-sm text-muted-foreground">
              por persona
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Información principal del vuelo */}
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {departureInfo.time}
            </div>
            <div className="text-sm text-muted-foreground">
              {firstSegment.departureAirport.code}
            </div>
            <div className="text-xs text-muted-foreground">
              {departureInfo.dayOfWeek} {departureInfo.date}
            </div>
          </div>

          <div className="flex-1 px-4">
            <div className="flex items-center justify-center mb-1">
              <div className="flex-1 h-px bg-border"></div>
              <div className="px-3 text-center">
                <div className="text-sm font-medium">
                  {formatDuration(flight.totalDuration)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {getStopsText(flight.stops)}
                </div>
              </div>
              <div className="flex-1 h-px bg-border"></div>
            </div>
            {flight.stops > 0 && (
              <div className="text-center">
                {flight.segments.slice(1).map((segment, index) => (
                  <div key={index} className="text-xs text-muted-foreground">
                    Escala en {segment.departureAirport.code}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold">
              {arrivalInfo.time}
            </div>
            <div className="text-sm text-muted-foreground">
              {lastSegment.arrivalAirport.code}
            </div>
            <div className="text-xs text-muted-foreground">
              {arrivalInfo.dayOfWeek} {arrivalInfo.date}
            </div>
          </div>
        </div>

        <Separator />

        {/* Información adicional */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-muted-foreground">Avión:</span>
              <span className="ml-1 font-medium">{firstSegment.aircraft}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Equipaje:</span>
              <span className="ml-1 font-medium">{flight.baggage.checked}kg</span>
            </div>
          </div>

          {/* Badges de características */}
          <div className="flex gap-2">
            {flight.stops === 0 && (
              <Badge variant="default" className="bg-green-500">
                Sin escalas
              </Badge>
            )}
            {flight.totalPrice < 1200 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Mejor precio
              </Badge>
            )}
            {flight.cancellationPolicy === 'Flexible' && (
              <Badge variant="outline">
                Cancelación flexible
              </Badge>
            )}
          </div>
        </div>

        {/* Segmentos detallados para vuelos con escalas */}
        {flight.segments.length > 1 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="text-sm font-medium text-muted-foreground">
              Detalles del viaje:
            </div>
            {flight.segments.map((segment, index) => {
              const segmentDeparture = formatDateTime(segment.departureTime);
              const segmentArrival = formatDateTime(segment.arrivalTime);
              
              return (
                <div key={segment.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {index + 1}
                    </Badge>
                    <span>
                      {segment.departureAirport.code} → {segment.arrivalAirport.code}
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    {segmentDeparture.time} - {segmentArrival.time}
                    <span className="ml-2">({formatDuration(segment.duration)})</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2 pt-2">
          <Button 
            className="flex-1" 
            onClick={handleSelect}
          >
            Ver Detalles
          </Button>
          {showCompareButton && (
            <Button 
              variant="outline" 
              onClick={handleCompare}
            >
              Comparar
            </Button>
          )}
        </div>

        {/* Información de políticas */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <div>Cancelación: {flight.cancellationPolicy}</div>
          <div>Cambios: {flight.changePolicy}</div>
          <div>Última actualización: {formatDateTime(flight.lastUpdated).time}</div>
        </div>
      </CardContent>
    </Card>
  );
}