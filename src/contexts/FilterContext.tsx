
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { EFFECT_OPTIONS, FLAVOR_OPTIONS } from '@/lib/mock-data';

export type SortOption = 'name-asc' | 'name-desc' | 'thc-asc' | 'thc-desc' | 'cbd-asc' | 'cbd-desc' | 'rating-asc' | 'rating-desc';

export const SORT_OPTIONS_CONFIG: {value: SortOption, label: string}[] = [
  { value: 'name-asc', label: 'Name (A-Z)'},
  { value: 'name-desc', label: 'Name (Z-A)'},
  { value: 'thc-asc', label: 'THC (Low to High)'},
  { value: 'thc-desc', label: 'THC (High to Low)'},
  { value: 'cbd-asc', label: 'CBD (Low to High)'},
  { value: 'cbd-desc', label: 'CBD (High to Low)'},
  { value: 'rating-asc', label: 'Rating (Low to High)'},
  { value: 'rating-desc', label: 'Rating (High to Low)'},
];

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
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');

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
    // setSortOption('name-asc'); // Optionally reset sort
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
        sortOption,
        setSortOption,
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

