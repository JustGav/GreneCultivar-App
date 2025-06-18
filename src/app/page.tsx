'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Cultivar, Genetics } from '@/types';
import { mockCultivars, getAllEffects } from '@/lib/mock-data';
import CultivarCard from '@/components/CultivarCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { Filter, ListRestart, Search, SortAsc, SortDesc, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type SortOption = 'name-asc' | 'name-desc' | 'thc-asc' | 'thc-desc' | 'cbd-asc' | 'cbd-desc' | 'rating-asc' | 'rating-desc';

const calculateAverageRating = (reviews: Cultivar['reviews']): number => {
  if (!reviews || reviews.length === 0) return 0;
  const total = reviews.reduce((acc, review) => acc + review.rating, 0);
  return total / reviews.length;
};

export default function CultivarBrowserPage() {
  const [cultivars, setCultivars] = useState<Cultivar[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [selectedGenetics, setSelectedGenetics] = useState<Genetics | 'All'>('All');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  
  const [allAvailableEffects, setAllAvailableEffects] = useState<string[]>([]);

  useEffect(() => {
    // Simulating data fetch
    setCultivars(mockCultivars);
    setAllAvailableEffects(getAllEffects());
  }, []);

  const handleEffectToggle = (effect: string) => {
    setSelectedEffects(prev =>
      prev.includes(effect) ? prev.filter(e => e !== effect) : [...prev, effect]
    );
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedEffects([]);
    setSelectedGenetics('All');
    setSortOption('name-asc');
  };
  
  const filteredAndSortedCultivars = useMemo(() => {
    let filtered = cultivars;

    if (searchTerm) {
      filtered = filtered.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (selectedEffects.length > 0) {
      filtered = filtered.filter(c => selectedEffects.every(eff => c.effects.includes(eff)));
    }

    if (selectedGenetics !== 'All') {
      filtered = filtered.filter(c => c.genetics === selectedGenetics);
    }

    return filtered.sort((a, b) => {
      const ratingA = calculateAverageRating(a.reviews);
      const ratingB = calculateAverageRating(b.reviews);
      switch (sortOption) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'thc-asc': return a.thc.max - b.thc.max;
        case 'thc-desc': return b.thc.max - a.thc.max;
        case 'cbd-asc': return a.cbd.max - b.cbd.max;
        case 'cbd-desc': return b.cbd.max - a.cbd.max;
        case 'rating-asc': return ratingA - ratingB;
        case 'rating-desc': return ratingB - ratingA;
        default: return 0;
      }
    });
  }, [cultivars, searchTerm, selectedEffects, selectedGenetics, sortOption]);

  const geneticsOptions: {value: Genetics | 'All', label: string}[] = [
    { value: 'All', label: 'All Genetics' },
    { value: 'Indica', label: 'Indica' },
    { value: 'Sativa', label: 'Sativa' },
    { value: 'Hybrid', label: 'Hybrid' },
  ];

  const sortOptions: {value: SortOption, label: string, icon?: React.ReactNode}[] = [
    { value: 'name-asc', label: 'Name (A-Z)'},
    { value: 'name-desc', label: 'Name (Z-A)'},
    { value: 'thc-asc', label: 'THC (Low to High)'},
    { value: 'thc-desc', label: 'THC (High to Low)'},
    { value: 'cbd-asc', label: 'CBD (Low to High)'},
    { value: 'cbd-desc', label: 'CBD (High to Low)'},
    { value: 'rating-asc', label: 'Rating (Low to High)'},
    { value: 'rating-desc', label: 'Rating (High to Low)'},
  ];


  return (
    <div className="space-y-8 animate-fadeIn">
      <section className="bg-card p-6 rounded-lg shadow-lg">
        <h1 className="text-4xl font-headline text-primary mb-2">Explore Cultivars</h1>
        <p className="text-muted-foreground font-body mb-6">
          Discover your next favorite strain. Filter by effects, genetics, or search by name.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              aria-label="Search by cultivar name"
            />
          </div>

          <Select value={selectedGenetics} onValueChange={(value) => setSelectedGenetics(value as Genetics | 'All')}>
            <SelectTrigger aria-label="Filter by genetics">
              <SelectValue placeholder="Filter by Genetics" />
            </SelectTrigger>
            <SelectContent>
              {geneticsOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                Sort By: {sortOptions.find(s => s.value === sortOption)?.label || 'Select'}
                {sortOption.endsWith('-asc') ? <SortAsc className="ml-2 h-4 w-4" /> : <SortDesc className="ml-2 h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuRadioGroup value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                {sortOptions.map(opt => (
                  <DropdownMenuRadioItem key={opt.value} value={opt.value}>{opt.label}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={resetFilters} variant="outline" className="w-full">
            <ListRestart className="mr-2 h-4 w-4" /> Reset Filters
          </Button>
        </div>
        
        <Separator className="my-6" />

        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Filter className="mr-2 h-5 w-5 text-primary" />
            Filter by Effects:
          </h3>
          <div className="flex flex-wrap gap-2">
            {allAvailableEffects.map(effect => (
              <Button
                key={effect}
                variant={selectedEffects.includes(effect) ? "default" : "outline"}
                onClick={() => handleEffectToggle(effect)}
                className={`transition-all duration-200 ease-in-out text-sm rounded-full px-4 py-1 ${selectedEffects.includes(effect) ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-accent/10'}`}
              >
                {effect}
                {selectedEffects.includes(effect) && <X className="ml-2 h-3 w-3" />}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {filteredAndSortedCultivars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedCultivars.map(cultivar => (
            <CultivarCard key={cultivar.id} cultivar={cultivar} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground font-body">No cultivars match your current filters.</p>
          <p className="text-sm text-muted-foreground font-body mt-2">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
}
