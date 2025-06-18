
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Cultivar, Genetics, CultivarStatus } from '@/types';
import { EFFECT_OPTIONS } from '@/lib/mock-data'; 
import { getCultivars, updateCultivarStatus } from '@/services/firebase';
import CultivarCard from '@/components/CultivarCard';
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { Filter, ListRestart, Search, SortAsc, SortDesc, X, Leaf, PlusCircle, Loader2, ArchiveIcon, EyeOff, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

type SortOption = 'name-asc' | 'name-desc' | 'thc-asc' | 'thc-desc' | 'cbd-asc' | 'cbd-desc' | 'rating-asc' | 'rating-desc';

const GENETIC_OPTIONS: Genetics[] = ['Sativa', 'Indica', 'Ruderalis', 'Hybrid'];
const ITEMS_PER_PAGE = 9;

const calculateAverageRating = (reviews: Cultivar['reviews']): number => {
  if (!reviews || reviews.length === 0) return 0;
  const total = reviews.reduce((acc, review) => acc + review.rating, 0);
  return total / reviews.length;
};

export default function CultivarBrowserPage() {
  const [allCultivars, setAllCultivars] = useState<Cultivar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [geneticFilters, setGeneticFilters] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  
  const allAvailableEffects = EFFECT_OPTIONS;

  const fetchCultivars = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedCultivars = await getCultivars();
      setAllCultivars(fetchedCultivars);
    } catch (error) {
      console.error("Failed to fetch cultivars:", error);
      toast({
        title: "Error fetching data",
        description: "Could not load cultivars from the database. Please try again later.",
        variant: "destructive",
      });
      setAllCultivars([]); 
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCultivars();
  }, [fetchCultivars]);

  const handleEffectToggle = (effect: string) => {
    setSelectedEffects(prev =>
      prev.includes(effect) ? prev.filter(e => e !== effect) : [...prev, effect]
    );
    setCurrentPage(1);
  };

  const handleGeneticFilterChange = (geneticType: Genetics, checked: boolean) => {
    setGeneticFilters(prev =>
      checked ? [...prev, geneticType] : prev.filter(g => g !== geneticType)
    );
    setCurrentPage(1);
  };

  const handleCultivarStatusChange = useCallback((cultivarId: string, newStatus: CultivarStatus) => {
    setAllCultivars(prevCultivars =>
      prevCultivars.map(c => 
        c.id === cultivarId ? { ...c, status: newStatus } : c
      )
    );
    // Potentially refetch or smarter update if status change affects filtering
    // For now, relying on the showArchived filter to re-evaluate
  }, []);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedEffects([]);
    setGeneticFilters([]);
    setShowArchived(false);
    setSortOption('name-asc');
    setCurrentPage(1);
  };
  
  const filteredAndSortedCultivars = useMemo(() => {
    let filtered = allCultivars;

    if (!showArchived) {
      filtered = filtered.filter(c => c.status !== 'archived');
    }

    if (searchTerm) {
      filtered = filtered.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (selectedEffects.length > 0) {
      filtered = filtered.filter(c => c.effects && selectedEffects.every(eff => c.effects.includes(eff)));
    }

    if (geneticFilters.length > 0) {
      filtered = filtered.filter(c => geneticFilters.includes(c.genetics));
    }

    return [...filtered].sort((a, b) => {
      const ratingA = calculateAverageRating(a.reviews);
      const ratingB = calculateAverageRating(b.reviews);
      const thcMaxA = a.thc?.max ?? 0;
      const thcMaxB = b.thc?.max ?? 0;
      const cbdMaxA = a.cbd?.max ?? 0;
      const cbdMaxB = b.cbd?.max ?? 0;

      switch (sortOption) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'thc-asc': return thcMaxA - thcMaxB;
        case 'thc-desc': return thcMaxB - thcMaxA;
        case 'cbd-asc': return cbdMaxA - cbdMaxB;
        case 'cbd-desc': return cbdMaxB - cbdMaxA;
        case 'rating-asc': return ratingA - ratingB;
        case 'rating-desc': return ratingB - ratingA;
        default: return 0;
      }
    });
  }, [allCultivars, searchTerm, selectedEffects, geneticFilters, sortOption, showArchived]);

  const totalPages = Math.ceil(filteredAndSortedCultivars.length / ITEMS_PER_PAGE);

  const paginatedCultivars = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAndSortedCultivars.slice(startIndex, endIndex);
  }, [filteredAndSortedCultivars, currentPage]);

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  
  const handleSortChange = (value: string) => {
    setSortOption(value as SortOption);
    setCurrentPage(1);
  }

  const handleShowArchivedToggle = () => {
    setShowArchived(prev => !prev);
    setCurrentPage(1);
  }

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
        <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-4">
          <div>
            <h1 className="text-4xl font-headline text-primary">Explore Cultivars</h1>
            <p className="text-muted-foreground font-body mt-1">
              Discover your next favorite strain. Filter by effects, genetics, or search by name.
            </p>
          </div>
          <Link href="/cultivars/add" passHref>
            <Button variant="default" className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add New Cultivar
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 items-end pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={handleSearchTermChange}
              className="pl-10"
              aria-label="Search by cultivar name"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                Sort By: {sortOptions.find(s => s.value === sortOption)?.label || 'Select'}
                {sortOption.endsWith('-asc') ? <SortAsc className="ml-2 h-4 w-4" /> : <SortDesc className="ml-2 h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuRadioGroup value={sortOption} onValueChange={handleSortChange}>
                {sortOptions.map(opt => (
                  <DropdownMenuRadioItem key={opt.value} value={opt.value}>{opt.label}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={resetFilters} variant="outline" className="w-full">
            <ListRestart className="mr-2 h-4 w-4" /> Reset Filters
          </Button>
          <Button onClick={handleShowArchivedToggle} variant="outline" className="w-full">
            {showArchived ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </Button>
        </div>
        
        <Separator className="my-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Leaf className="mr-2 h-5 w-5 text-primary" />
              Filter by Genetics:
            </h3>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {GENETIC_OPTIONS.map(geneticType => (
                  <div key={geneticType} className="flex items-center space-x-2">
                    <Checkbox
                      id={`genetic-${geneticType}`}
                      checked={geneticFilters.includes(geneticType)}
                      onCheckedChange={(checked) => handleGeneticFilterChange(geneticType, !!checked)}
                      aria-label={`Filter by ${geneticType}`}
                    />
                    <Label htmlFor={`genetic-${geneticType}`} className="font-normal text-sm">{geneticType}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

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
                  className={`transition-all duration-200 ease-in-out text-sm rounded-full px-4 py-1.5 ${selectedEffects.includes(effect) ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-accent/10'}`}
                  aria-pressed={selectedEffects.includes(effect)}
                >
                  {effect}
                  {selectedEffects.includes(effect) && <X className="ml-2 h-3 w-3" />}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Loading cultivars...</p>
        </div>
      ) : paginatedCultivars.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCultivars.map(cultivar => (
              <CultivarCard key={cultivar.id} cultivar={cultivar} onStatusChange={handleCultivarStatusChange} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-4 mt-8">
              <Button
                variant="outline"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                aria-label="Go to previous page"
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                aria-label="Go to next page"
              >
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Search className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground font-body">No cultivars match your current filters.</p>
          <p className="text-sm text-muted-foreground font-body mt-2">Try adjusting your search or filter criteria, or add some cultivars to your database!</p>
        </div>
      )}
    </div>
  );
}
