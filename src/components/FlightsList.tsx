'use client';

import { useState } from 'react';
import { Flight, SortOptions } from '@/types/flight';
import { FlightCard } from './FlightCard';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface FlightsListProps {
  flights: Flight[];
  loading?: boolean;
  sortOptions: SortOptions;
  onSortChange: (sort: SortOptions) => void;
  onFlightSelect?: (flight: Flight) => void;
  onFlightCompare?: (flight: Flight) => void;
  selectedFlight?: Flight | null;
  compareFlights?: Flight[];
}

export function FlightsList({
  flights,
  loading = false,
  sortOptions,
  onSortChange,
  onFlightSelect,
  onFlightCompare,
  selectedFlight,
  compareFlights = []
}: FlightsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const flightsPerPage = 5;

  const totalPages = Math.ceil(flights.length / flightsPerPage);
  const startIndex = (currentPage - 1) * flightsPerPage;
  const endIndex = startIndex + flightsPerPage;
  const currentFlights = flights.slice(startIndex, endIndex);

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split('-') as [SortOptions['field'], SortOptions['direction']];
    onSortChange({ field, direction });
    setCurrentPage(1); // Reset a primera página al cambiar ordenamiento
  };



  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-8 w-24" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-12 w-16" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-12 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center space-y-4">
            <div className="text-6xl">✈️</div>
            <div className="text-xl font-semibold">No se encontraron vuelos</div>
            <div className="text-muted-foreground">
              Intenta ajustar tus filtros o cambiar las fechas de búsqueda
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con información y controles */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg">
                {flights.length} vuelo{flights.length !== 1 ? 's' : ''} encontrado{flights.length !== 1 ? 's' : ''}
              </CardTitle>
              {totalPages > 1 && (
                <div className="text-sm text-muted-foreground mt-1">
                  Mostrando {startIndex + 1}-{Math.min(endIndex, flights.length)} de {flights.length}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Mostrar filtros activos */}
              {compareFlights.length > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {compareFlights.length} para comparar
                </Badge>
              )}

              {/* Selector de ordenamiento */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Ordenar por:</span>
                <Select 
                  value={`${sortOptions.field}-${sortOptions.direction}`}
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-asc">Precio (menor a mayor)</SelectItem>
                    <SelectItem value="price-desc">Precio (mayor a menor)</SelectItem>
                    <SelectItem value="duration-asc">Duración (menor a mayor)</SelectItem>
                    <SelectItem value="duration-desc">Duración (mayor a menor)</SelectItem>
                    <SelectItem value="departure-asc">Salida (más temprano)</SelectItem>
                    <SelectItem value="departure-desc">Salida (más tarde)</SelectItem>
                    <SelectItem value="arrival-asc">Llegada (más temprano)</SelectItem>
                    <SelectItem value="arrival-desc">Llegada (más tarde)</SelectItem>
                    <SelectItem value="stops-asc">Escalas (menor a mayor)</SelectItem>
                    <SelectItem value="stops-desc">Escalas (mayor a menor)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de vuelos */}
      <div className="space-y-4">
        {currentFlights.map((flight) => (
          <FlightCard
            key={flight.id}
            flight={flight}
            onSelect={onFlightSelect}
            onCompare={onFlightCompare}
            isSelected={selectedFlight?.id === flight.id}
            showCompareButton={!!onFlightCompare}
          />
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-center items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .filter(page => 
                    page === 1 || 
                    page === totalPages || 
                    Math.abs(page - currentPage) <= 1
                  )
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center">
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="text-muted-foreground mx-1">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    </div>
                  ))
                }
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
            
            <div className="text-center text-sm text-muted-foreground mt-2">
              Página {currentPage} de {totalPages}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}