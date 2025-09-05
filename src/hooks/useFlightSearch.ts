'use client';

import { useState, useCallback, useEffect } from 'react';
import { Flight, SearchParams, SearchFilters, SortOptions, SearchResponse } from '@/types/flight';
import { filterFlights, sortFlights } from '@/lib/flight-utils';

interface UseFlightSearchState {
  flights: Flight[];
  filteredFlights: Flight[];
  loading: boolean;
  error: string | null;
  searchParams: SearchParams | null;
  filters: SearchFilters;
  sortOptions: SortOptions;
  searchId: string | null;
}

export function useFlightSearch() {
  const [state, setState] = useState<UseFlightSearchState>({
    flights: [],
    filteredFlights: [],
    loading: false,
    error: null,
    searchParams: null,
    filters: {},
    sortOptions: { field: 'price', direction: 'asc' },
    searchId: null
  });

  // Función para realizar búsqueda
  const searchFlights = useCallback(async (params: SearchParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch('/api/flights/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en la búsqueda');
      }

      const searchResponse: SearchResponse = await response.json();
      
      setState(prev => ({
        ...prev,
        flights: searchResponse.flights,
        filteredFlights: searchResponse.flights,
        loading: false,
        searchParams: params,
        searchId: searchResponse.searchId,
        // Resetear filtros al hacer nueva búsqueda
        filters: {}
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }));
    }
  }, []);

  // Función para aplicar filtros
  const applyFilters = useCallback((newFilters: SearchFilters) => {
    setState(prev => {
      const filtered = filterFlights(prev.flights, newFilters);
      const sorted = sortFlights(filtered, prev.sortOptions);
      
      return {
        ...prev,
        filters: newFilters,
        filteredFlights: sorted
      };
    });
  }, []);

  // Función para cambiar ordenamiento
  const applySorting = useCallback((sortOptions: SortOptions) => {
    setState(prev => {
      const sorted = sortFlights(prev.filteredFlights, sortOptions);
      
      return {
        ...prev,
        sortOptions,
        filteredFlights: sorted
      };
    });
  }, []);

  // Función para limpiar filtros
  const clearFilters = useCallback(() => {
    setState(prev => {
      const sorted = sortFlights(prev.flights, prev.sortOptions);
      
      return {
        ...prev,
        filters: {},
        filteredFlights: sorted
      };
    });
  }, []);

  // Función para resetear búsqueda
  const resetSearch = useCallback(() => {
    setState({
      flights: [],
      filteredFlights: [],
      loading: false,
      error: null,
      searchParams: null,
      filters: {},
      sortOptions: { field: 'price', direction: 'asc' },
      searchId: null
    });
  }, []);

  // Efecto para re-aplicar filtros y ordenamiento cuando cambian los vuelos
  useEffect(() => {
    if (state.flights.length > 0) {
      const filtered = filterFlights(state.flights, state.filters);
      const sorted = sortFlights(filtered, state.sortOptions);
      
      setState(prev => ({
        ...prev,
        filteredFlights: sorted
      }));
    }
  }, [state.flights, state.filters, state.sortOptions]);

  // Función para obtener estadísticas de la búsqueda
  const getSearchStats = useCallback(() => {
    const { flights, filteredFlights } = state;
    
    if (flights.length === 0) {
      return {
        totalFlights: 0,
        filteredFlights: 0,
        hasFilters: false
      };
    }

    const hasActiveFilters = Object.keys(state.filters).some(key => {
      const value = state.filters[key as keyof SearchFilters];
      return Array.isArray(value) ? value.length > 0 : value !== undefined;
    });

    return {
      totalFlights: flights.length,
      filteredFlights: filteredFlights.length,
      hasFilters: hasActiveFilters
    };
  }, [state.flights, state.filteredFlights, state.filters]);

  return {
    // Estado
    flights: state.filteredFlights,
    loading: state.loading,
    error: state.error,
    searchParams: state.searchParams,
    filters: state.filters,
    sortOptions: state.sortOptions,
    searchId: state.searchId,
    
    // Acciones
    searchFlights,
    applyFilters,
    applySorting,
    clearFilters,
    resetSearch,
    
    // Utilidades
    getSearchStats
  };
}