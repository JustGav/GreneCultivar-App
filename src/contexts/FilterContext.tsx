
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { EFFECT_OPTIONS, FLAVOR_OPTIONS } from '@/lib/mock-data';

interface FilterContextType {
  selectedEffects: string[];
  selectedFlavors: string[];
  allAvailableEffects: string[];
  allAvailableFlavors: string[];
  toggleEffect: (effect: string) => void;
  toggleFlavor: (flavor: string) => void;
  resetFilters: () => void;
  isFiltersActive: boolean;
  setSearchTerm: (term: string) => void;
  searchTerm: string;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const allAvailableEffects = useMemo(() => EFFECT_OPTIONS.sort(), []);
  const allAvailableFlavors = useMemo(() => FLAVOR_OPTIONS.sort(), []);

  const toggleEffect = useCallback((effect: string) => {
    setSelectedEffects(prev =>
      prev.includes(effect) ? prev.filter(e => e !== effect) : [...prev, effect]
    );
  }, []);

  const toggleFlavor = useCallback((flavor: string) => {
    setSelectedFlavors(prev =>
      prev.includes(flavor) ? prev.filter(f => f !== flavor) : [...prev, flavor]
    );
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedEffects([]);
    setSelectedFlavors([]);
    // setSearchTerm(''); // Optionally reset search term here too if desired
  }, []);

  const isFiltersActive = useMemo(
    () => selectedEffects.length > 0 || selectedFlavors.length > 0,
    [selectedEffects, selectedFlavors]
  );

  return (
    <FilterContext.Provider
      value={{
        selectedEffects,
        selectedFlavors,
        allAvailableEffects,
        allAvailableFlavors,
        toggleEffect,
        toggleFlavor,
        resetFilters,
        isFiltersActive,
        searchTerm,
        setSearchTerm,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilterContext = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilterContext must be used within a FilterProvider');
  }
  return context;
};
