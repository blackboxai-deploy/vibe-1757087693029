'use client'

import { useState } from 'react'
import { SearchForm } from '@/components/SearchForm'
import { FlightsList } from '@/components/FlightsList'
import { FilterSidebar } from '@/components/FilterSidebar'
import { LoadingState } from '@/components/LoadingState'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Card, CardContent } from '@/components/ui/card'
import type { Flight, SearchParams, FilterOptions, LoadingState as LoadingStateType } from '@/types/flight'

export default function HomePage() {
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState<LoadingStateType>('idle')
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null)
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: { min: 0, max: 5000 },
    airlines: [],
    maxStops: 3,
    departureTime: { min: '00:00', max: '23:59' },
    duration: { min: 0, max: 1440 },
    airports: []
  })
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'departure'>('price')

  const handleSearch = async (params: SearchParams) => {
    setLoading('loading')
    setSearchParams(params)
    
    try {
      const response = await fetch('/api/flights/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })
      
      if (!response.ok) {
        throw new Error('Error searching flights')
      }
      
      const data = await response.json()
      setFlights(data.flights || [])
      setLoading('success')
    } catch (error) {
      console.error('Search error:', error)
      setLoading('error')
      setFlights([])
    }
  }

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const filteredFlights = flights.filter(flight => {
    // Price filter
    if (flight.price.total < filters.priceRange.min || flight.price.total > filters.priceRange.max) {
      return false
    }
    
    // Airlines filter
    if (filters.airlines.length > 0) {
      const hasAirline = flight.segments.some(segment => 
        filters.airlines.includes(segment.airline.code)
      )
      if (!hasAirline) return false
    }
    
    // Stops filter
    if (flight.stops > filters.maxStops) {
      return false
    }
    
    return true
  })

  const sortedFlights = [...filteredFlights].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price.total - b.price.total
      case 'duration':
        return a.duration - b.duration
      case 'departure':
        return new Date(a.segments[0].departure.time).getTime() - new Date(b.segments[0].departure.time).getTime()
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Encuentra tu vuelo perfecto
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Compara precios y horarios de vuelos desde Buenos Aires a Miami. 
            Los mejores deals en un solo lugar.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-white/80">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm">Búsqueda en tiempo real</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-sm">Mejores precios garantizados</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-sm">Sin comisiones ocultas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <Card className="shadow-2xl border-0">
          <CardContent className="p-6">
            <SearchForm onSearch={handleSearch} loading={loading === 'loading'} />
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      {searchParams && (
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Mobile Filter Button */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Filtros y Ordenamiento
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <FilterSidebar
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    flights={flights}
                  />
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:w-80 flex-shrink-0">
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                sortBy={sortBy}
                onSortChange={setSortBy}
                flights={flights}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {loading === 'loading' && <LoadingState />}
              
              {loading === 'error' && (
                <div className="text-center py-12">
                  <div className="text-red-600 text-lg font-semibold mb-2">
                    Error al buscar vuelos
                  </div>
                  <p className="text-muted-foreground mb-4">
                    No pudimos encontrar vuelos. Por favor intenta nuevamente.
                  </p>
                  <Button onClick={() => searchParams && handleSearch(searchParams)}>
                    Intentar nuevamente
                  </Button>
                </div>
              )}
              
              {loading === 'success' && sortedFlights.length === 0 && (
                <EmptyState onNewSearch={() => setSearchParams(null)} />
              )}
              
              {loading === 'success' && sortedFlights.length > 0 && (
                <FlightsList
                  flights={sortedFlights}
                  searchParams={searchParams}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Features Section - Only show when no search has been made */}
      {!searchParams && (
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir FlightFinder?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tu compañero de confianza para encontrar los mejores vuelos Buenos Aires - Miami
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Búsqueda Inteligente</h3>
              <p className="text-gray-600">
                Comparamos precios de múltiples aerolíneas para encontrar la mejor opción para ti.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Mejores Precios</h3>
              <p className="text-gray-600">
                Sin comisiones ocultas. El precio que ves es el precio que pagas.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Rápido y Fácil</h3>
              <p className="text-gray-600">
                Encuentra y compara vuelos en segundos con nuestra interfaz intuitiva.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}