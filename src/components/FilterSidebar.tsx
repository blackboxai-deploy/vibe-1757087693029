'use client';

import { useState, useEffect } from 'react';
import { SearchFilters, Flight } from '@/types/flight';
import { getPriceRange, getUniqueAirlines, formatPrice, getTimeOfDayText } from '@/lib/flight-utils';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface FilterSidebarProps {
  flights: Flight[];
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClearFilters: () => void;
}

export function FilterSidebar({
  flights,
  filters,
  onFiltersChange,
  onClearFilters
}: FilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const priceRange = getPriceRange(flights);
  const availableAirlines = getUniqueAirlines(flights);

  // Sincronizar filtros locales con props
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Aplicar filtros con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange(localFilters);
    }, 300);

    return () => clearTimeout(timer);
  }, [localFilters, onFiltersChange]);

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleAirline = (airlineCode: string) => {
    const currentAirlines = localFilters.airlines || [];
    const updatedAirlines = currentAirlines.includes(airlineCode)
      ? currentAirlines.filter(code => code !== airlineCode)
      : [...currentAirlines, airlineCode];
    
    updateFilter('airlines', updatedAirlines.length > 0 ? updatedAirlines : undefined);
  };

  const toggleTimeOfDay = (timeOfDay: 'morning' | 'afternoon' | 'evening') => {
    const currentTimes = localFilters.timeOfDay || [];
    const updatedTimes = currentTimes.includes(timeOfDay)
      ? currentTimes.filter(time => time !== timeOfDay)
      : [...currentTimes, timeOfDay];
    
    updateFilter('timeOfDay', updatedTimes.length > 0 ? updatedTimes : undefined);
  };

  const hasActiveFilters = Object.keys(localFilters).some(key => {
    const value = localFilters[key as keyof SearchFilters];
    return Array.isArray(value) ? value.length > 0 : value !== undefined;
  });

  if (flights.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Realiza una búsqueda para ver filtros
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtros</CardTitle>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearFilters}
              className="h-8 px-2 text-xs"
            >
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filtro de precio */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Precio por persona</Label>
          <div className="px-2">
            <Slider
              value={[
                localFilters.minPrice || priceRange.min,
                localFilters.maxPrice || priceRange.max
              ]}
              min={priceRange.min}
              max={priceRange.max}
              step={50}
              onValueChange={([min, max]) => {
                updateFilter('minPrice', min > priceRange.min ? min : undefined);
                updateFilter('maxPrice', max < priceRange.max ? max : undefined);
              }}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatPrice(localFilters.minPrice || priceRange.min)}</span>
            <span>{formatPrice(localFilters.maxPrice || priceRange.max)}</span>
          </div>
        </div>

        <Separator />

        {/* Filtro de escalas */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Escalas</Label>
          <div className="space-y-2">
            {[0, 1, 2].map((stops) => (
              <div key={stops} className="flex items-center space-x-2">
                <Checkbox
                  id={`stops-${stops}`}
                  checked={localFilters.maxStops === stops}
                  onCheckedChange={(checked) => {
                    updateFilter('maxStops', checked ? stops : undefined);
                  }}
                />
                <Label htmlFor={`stops-${stops}`} className="text-sm cursor-pointer">
                  {stops === 0 ? 'Sin escalas' : 
                   stops === 1 ? 'Máximo 1 escala' : 'Máximo 2 escalas'}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Filtro de aerolíneas */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Aerolíneas</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableAirlines.map((airline) => (
              <div key={airline.code} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`airline-${airline.code}`}
                    checked={localFilters.airlines?.includes(airline.code) || false}
                    onCheckedChange={() => toggleAirline(airline.code)}
                  />
                  <Label htmlFor={`airline-${airline.code}`} className="text-sm cursor-pointer">
                    {airline.name}
                  </Label>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {airline.count}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Filtro de horarios */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Horario de salida</Label>
          <div className="space-y-2">
            {(['morning', 'afternoon', 'evening'] as const).map((timeOfDay) => (
              <div key={timeOfDay} className="flex items-center space-x-2">
                <Checkbox
                  id={`time-${timeOfDay}`}
                  checked={localFilters.timeOfDay?.includes(timeOfDay) || false}
                  onCheckedChange={() => toggleTimeOfDay(timeOfDay)}
                />
                <Label htmlFor={`time-${timeOfDay}`} className="text-sm cursor-pointer">
                  {getTimeOfDayText(timeOfDay)}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Filtro de duración */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Duración máxima</Label>
          <div className="space-y-2">
            {[
              { value: 480, label: '8 horas' },
              { value: 600, label: '10 horas' },
              { value: 720, label: '12 horas' },
              { value: 900, label: '15 horas' },
            ].map(({ value, label }) => (
              <div key={value} className="flex items-center space-x-2">
                <Checkbox
                  id={`duration-${value}`}
                  checked={localFilters.maxDuration === value}
                  onCheckedChange={(checked) => {
                    updateFilter('maxDuration', checked ? value : undefined);
                  }}
                />
                <Label htmlFor={`duration-${value}`} className="text-sm cursor-pointer">
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen de filtros activos */}
        {hasActiveFilters && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm font-medium">Filtros activos:</Label>
              <div className="flex flex-wrap gap-1">
                {localFilters.minPrice && (
                  <Badge variant="secondary" className="text-xs">
                    Min: {formatPrice(localFilters.minPrice)}
                  </Badge>
                )}
                {localFilters.maxPrice && (
                  <Badge variant="secondary" className="text-xs">
                    Max: {formatPrice(localFilters.maxPrice)}
                  </Badge>
                )}
                {localFilters.maxStops !== undefined && (
                  <Badge variant="secondary" className="text-xs">
                    {localFilters.maxStops === 0 ? 'Sin escalas' : `Max ${localFilters.maxStops} escalas`}
                  </Badge>
                )}
                {localFilters.airlines?.map(airline => (
                  <Badge key={airline} variant="secondary" className="text-xs">
                    {airline}
                  </Badge>
                ))}
                {localFilters.timeOfDay?.map(time => (
                  <Badge key={time} variant="secondary" className="text-xs">
                    {time === 'morning' ? 'Mañana' : 
                     time === 'afternoon' ? 'Tarde' : 'Noche'}
                  </Badge>
                ))}
                {localFilters.maxDuration && (
                  <Badge variant="secondary" className="text-xs">
                    Max {Math.floor(localFilters.maxDuration / 60)}h
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}