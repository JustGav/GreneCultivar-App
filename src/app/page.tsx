
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Cultivar, Genetics, CultivarStatus } from '@/types';
import { getCultivars } from '@/services/firebase';
import CultivarCard from '@/components/CultivarCard';
import CultivarDetailModal from '@/components/CultivarDetailModal';
import { Button } from '@/components/ui/button';
import { Loader2, EyeOff, Eye, ChevronLeft, ChevronRight, Filter as FilterIcon } from 'lucide-react'; 
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useFilterContext, type SortOption, SORT_OPTIONS_CONFIG } from '@/contexts/FilterContext'; 

const ITEMS_PER_PAGE = 9;

const calculateAverageRating = (reviews: Cultivar['reviews']): number => {
  if (!reviews || reviews.length === 0) return 0;
  const total = reviews.reduce((acc, review) => acc + review.rating, 0);
  return total / reviews.length;
};

export interface CultivarInfoForMap {
  id: string;
  name: string; 
  status: CultivarStatus;
  parents: string[];
  children: string[];
}

export default function CultivarBrowserPage() {
  const [allCultivars, setAllCultivars] = useState<Cultivar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Consume sortOption from context, not local state
  const { searchTerm, selectedEffects, selectedFlavors, sortOption, setSortOption } = useFilterContext(); 
  const [showArchived, setShowArchived] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const [selectedCultivarForModal, setSelectedCultivarForModal] = useState<Cultivar | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cultivarInfoMap, setCultivarInfoMap] = useState<Map<string, CultivarInfoForMap>>(new Map());

  const fetchCultivars = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedCultivars = await getCultivars();
      setAllCultivars(fetchedCultivars);
      const infoMap = new Map<string, CultivarInfoForMap>();
        fetchedCultivars.forEach(c => {
            infoMap.set(c.name.toLowerCase(), {
              id: c.id,
              name: c.name,
              status: c.status,
              parents: c.parents || [],
              children: c.children || []
            });
        });
      setCultivarInfoMap(infoMap);
    } catch (error) {
      console.error("Failed to fetch cultivars:", error);
      toast({
        title: "Error fetching data",
        description: "Could not load cultivars from the database. Please try again later.",
        variant: "destructive",
      });
      setAllCultivars([]);
      setCultivarInfoMap(new Map());
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCultivars();
  }, [fetchCultivars]);

  const filteredAndSortedCultivars = useMemo(() => {
    let baseFilteredCultivars: Cultivar[];

    if (!user && !authLoading) { 
      baseFilteredCultivars = allCultivars.filter(c => c.status === 'Live' || c.status === 'featured');
    } else if (user) { 
      if (!showArchived) {
        baseFilteredCultivars = allCultivars.filter(c => c.status !== 'archived');
      } else {
        baseFilteredCultivars = [...allCultivars];
      }
    } else { 
        baseFilteredCultivars = [];
    }

    let furtherFilteredCultivars = baseFilteredCultivars;
    
    if (searchTerm) {
      furtherFilteredCultivars = furtherFilteredCultivars.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedEffects.length > 0) {
      furtherFilteredCultivars = furtherFilteredCultivars.filter(c => c.effects && selectedEffects.every(eff => c.effects.includes(eff)));
    }
    if (selectedFlavors.length > 0) {
      furtherFilteredCultivars = furtherFilteredCultivars.filter(c => c.flavors && selectedFlavors.every(flav => c.flavors.includes(flav)));
    }

    return [...furtherFilteredCultivars].sort((a, b) => {
      const isPublic = !user;
      if (isPublic) {
        const isAFeatured = a.status === 'featured';
        const isBFeatured = b.status === 'featured';
        if (isAFeatured && !isBFeatured) return -1;
        if (!isAFeatured && isBFeatured) return 1;
      }

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
  }, [allCultivars, searchTerm, selectedEffects, selectedFlavors, sortOption, showArchived, user, authLoading]);


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

  // handleSortChange is removed, as sort is managed by FilterContext via Header

  const handleShowArchivedToggle = () => {
    setShowArchived(prev => !prev);
    setCurrentPage(1);
  }

  const handleOpenCultivarModal = (cultivar: Cultivar) => {
    setSelectedCultivarForModal(cultivar);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    } else if (currentPage === 0 && totalPages > 0) {
       setCurrentPage(1);
    } else if (filteredAndSortedCultivars.length === 0 && currentPage !==1) {
      setCurrentPage(1);
    }
  }, [selectedEffects, selectedFlavors, searchTerm, totalPages, currentPage, filteredAndSortedCultivars.length]);


  return (
    <div className="space-y-8 animate-fadeIn">
      <section className="bg-card p-6 rounded-lg shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-4">
          <div>
            <h1 className="text-4xl font-headline text-primary">Explore Cultivars</h1>
            <p className="text-muted-foreground font-body mt-1">
              Discover your next favorite strain. Use the search, filter, and sort options in the header.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 items-end pt-4">
          <div></div> {/* Placeholder for layout if needed */}
          {/* Sort Dropdown removed from here */}
          
          {(!authLoading && user) && (
            <Button onClick={handleShowArchivedToggle} variant="outline" className="w-full md:w-auto">
              {showArchived ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {showArchived ? 'Hide Archived' : 'Show Archived'}
            </Button>
          )}
        </div>
      </section>

      {isLoading || authLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">{authLoading && !user ? 'Checking authentication...' : 'Loading cultivars...'}</p>
        </div>
      ) : paginatedCultivars.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCultivars.map(cultivar => (
              <CultivarCard 
                key={cultivar.id} 
                cultivar={cultivar} 
                isPublicView={!user}
                onViewInModal={handleOpenCultivarModal}
              />
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
          <FilterIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground font-body">No cultivars match your current filters.</p>
          <p className="text-sm text-muted-foreground font-body mt-2">Try adjusting your search or filter criteria, or click "Reset Filters" in the filter modal.</p>
        </div>
      )}
      <CultivarDetailModal 
        cultivar={selectedCultivarForModal} 
        isOpen={isModalOpen} 
        onOpenChange={setIsModalOpen}
        cultivarInfoMap={cultivarInfoMap}
      />
    </div>
  );
}

