'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

import { SearchParams, AIRPORTS } from '@/types/flight';

const searchSchema = z.object({
  origin: z.string().min(3, 'Selecciona un aeropuerto de origen'),
  destination: z.string().min(3, 'Selecciona un aeropuerto de destino'),
  departureDate: z.string().min(10, 'Selecciona fecha de salida'),
  returnDate: z.string().optional(),
  adults: z.number().min(1, 'Mínimo 1 adulto').max(9, 'Máximo 9 adultos'),
  children: z.number().min(0).max(9, 'Máximo 9 niños'),
  infants: z.number().min(0).max(9, 'Máximo 9 bebés'),
  class: z.enum(['economy', 'business', 'first']),
  tripType: z.enum(['one-way', 'round-trip'])
});

type SearchFormData = z.infer<typeof searchSchema>;

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  loading?: boolean;
}

export function SearchForm({ onSearch, loading = false }: SearchFormProps) {
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('round-trip');
  
  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      origin: 'EZE',
      destination: 'MIA',
      departureDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      returnDate: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
      adults: 1,
      children: 0,
      infants: 0,
      class: 'economy',
      tripType: 'round-trip'
    }
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const watchedValues = watch();

  const onSubmit = (data: SearchFormData) => {
    const searchParams: SearchParams = {
      origin: data.origin,
      destination: data.destination,
      departureDate: data.departureDate,
      returnDate: data.tripType === 'round-trip' ? data.returnDate : undefined,
      passengers: {
        adults: data.adults,
        children: data.children,
        infants: data.infants
      },
      class: data.class,
      tripType: data.tripType
    };

    onSearch(searchParams);
  };

  const handleTripTypeChange = (type: 'one-way' | 'round-trip') => {
    setTripType(type);
    setValue('tripType', type);
  };

  const totalPassengers = watchedValues.adults + watchedValues.children + watchedValues.infants;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Buscar Vuelos Buenos Aires - Miami
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Tipo de viaje */}
          <Tabs value={tripType} onValueChange={handleTripTypeChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="round-trip">Ida y Vuelta</TabsTrigger>
              <TabsTrigger value="one-way">Solo Ida</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Origen y Destino */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin">Desde</Label>
              <Select 
                value={watchedValues.origin} 
                onValueChange={(value) => setValue('origin', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar origen" />
                </SelectTrigger>
                <SelectContent>
                  {AIRPORTS.BUENOS_AIRES.map((airport) => (
                    <SelectItem key={airport.code} value={airport.code}>
                      <div>
                        <div className="font-medium">{airport.code}</div>
                        <div className="text-sm text-muted-foreground">{airport.name}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.origin && (
                <p className="text-sm text-red-500">{errors.origin.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Hacia</Label>
              <Select 
                value={watchedValues.destination} 
                onValueChange={(value) => setValue('destination', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar destino" />
                </SelectTrigger>
                <SelectContent>
                  {AIRPORTS.MIAMI.map((airport) => (
                    <SelectItem key={airport.code} value={airport.code}>
                      <div>
                        <div className="font-medium">{airport.code}</div>
                        <div className="text-sm text-muted-foreground">{airport.name}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.destination && (
                <p className="text-sm text-red-500">{errors.destination.message}</p>
              )}
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departureDate">Fecha de Salida</Label>
              <Input
                {...register('departureDate')}
                type="date"
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full"
              />
              {errors.departureDate && (
                <p className="text-sm text-red-500">{errors.departureDate.message}</p>
              )}
            </div>

            {tripType === 'round-trip' && (
              <div className="space-y-2">
                <Label htmlFor="returnDate">Fecha de Regreso</Label>
                <Input
                  {...register('returnDate')}
                  type="date"
                  min={watchedValues.departureDate}
                  className="w-full"
                />
                {errors.returnDate && (
                  <p className="text-sm text-red-500">{errors.returnDate.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Pasajeros y Clase */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Label>Pasajeros</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Adultos</div>
                    <div className="text-sm text-muted-foreground">12+ años</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setValue('adults', Math.max(1, watchedValues.adults - 1))}
                      disabled={watchedValues.adults <= 1}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{watchedValues.adults}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setValue('adults', Math.min(9, watchedValues.adults + 1))}
                      disabled={watchedValues.adults >= 9}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Niños</div>
                    <div className="text-sm text-muted-foreground">2-11 años</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setValue('children', Math.max(0, watchedValues.children - 1))}
                      disabled={watchedValues.children <= 0}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{watchedValues.children}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setValue('children', Math.min(9, watchedValues.children + 1))}
                      disabled={watchedValues.children >= 9}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Bebés</div>
                    <div className="text-sm text-muted-foreground">0-2 años</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setValue('infants', Math.max(0, watchedValues.infants - 1))}
                      disabled={watchedValues.infants <= 0}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{watchedValues.infants}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setValue('infants', Math.min(9, watchedValues.infants + 1))}
                      disabled={watchedValues.infants >= 9}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
              {totalPassengers > 9 && (
                <p className="text-sm text-red-500">Máximo 9 pasajeros total</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="class">Clase</Label>
              <Select 
                value={watchedValues.class} 
                onValueChange={(value) => setValue('class', value as 'economy' | 'business' | 'first')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="economy">
                    <div>
                      <div className="font-medium">Económica</div>
                      <div className="text-sm text-muted-foreground">La opción más económica</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="business">
                    <div>
                      <div className="font-medium">Ejecutiva</div>
                      <div className="text-sm text-muted-foreground">Comodidad premium</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="first">
                    <div>
                      <div className="font-medium">Primera</div>
                      <div className="text-sm text-muted-foreground">Lujo y servicio exclusivo</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Resumen de búsqueda */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {AIRPORTS.BUENOS_AIRES.find(a => a.code === watchedValues.origin)?.code} → {AIRPORTS.MIAMI[0].code}
            </Badge>
            <Badge variant="secondary">
              {totalPassengers} pasajero{totalPassengers !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="secondary">
              {watchedValues.class === 'economy' ? 'Económica' : 
               watchedValues.class === 'business' ? 'Ejecutiva' : 'Primera'}
            </Badge>
            <Badge variant="secondary">
              {tripType === 'round-trip' ? 'Ida y vuelta' : 'Solo ida'}
            </Badge>
          </div>

          {/* Botón de búsqueda */}
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={loading || totalPassengers > 9}
          >
            {loading ? 'Buscando vuelos...' : 'Buscar Vuelos'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}