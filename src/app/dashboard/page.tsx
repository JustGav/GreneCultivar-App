
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Cultivar, Genetics, CultivarStatus } from '@/types';
import { EFFECT_OPTIONS, FLAVOR_OPTIONS } from '@/lib/mock-data';
import { getCultivars, updateCultivarStatus, updateMultipleCultivarStatuses } from '@/services/firebase';
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { Filter, ListRestart, Search, SortAsc, SortDesc, X, Leaf, PlusCircle, Loader2, Archive, EyeOff, Eye, ChevronLeft, ChevronRight, Utensils, ChevronsUpDown, AlertTriangle, Edit, ImageOff, ShieldCheck, Hourglass, Info as InfoIcon, Star as StarIcon, CheckSquare, Square, Users, ChevronDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type SortOption = 'name-asc' | 'name-desc' | 'thc-asc' | 'thc-desc' | 'cbd-asc' | 'cbd-desc' | 'rating-asc' | 'rating-desc';

const ITEMS_PER_PAGE = 10;
const GENETIC_OPTIONS: Genetics[] = ['Sativa', 'Indica', 'Hybrid', 'Ruderalis'];

const calculateAverageRating = (reviews: Cultivar['reviews']): number => {
  if (!reviews || reviews.length === 0) return 0;
  const total = reviews.reduce((acc, review) => acc + review.rating, 0);
  return total / reviews.length;
};

const STATUS_OPTIONS_ORDERED: CultivarStatus[] = ['Live', 'featured', 'User Submitted', 'recentlyAdded', 'Hide', 'archived'];

const STATUS_LABELS: Record<CultivarStatus, string> = {
  Live: 'Live',
  featured: 'Featured',
  recentlyAdded: 'Recently Added',
  'User Submitted': 'User Submitted',
  Hide: 'Hidden',
  archived: 'Archived',
};

const getStatusBadgeVariant = (status?: CultivarStatus): "default" | "secondary" | "destructive" | "outline" => {
  if (!status) return 'outline';
  switch (status) {
    case 'Live': return 'default';
    case 'featured': return 'default';
    case 'User Submitted': return 'secondary';
    case 'recentlyAdded': return 'secondary';
    case 'Hide': return 'destructive';
    case 'archived': return 'destructive';
    default: return 'outline';
  }
};

const getStatusIcon = (status?: CultivarStatus) => {
  if (!status) return <InfoIcon size={14} className="mr-1" />;
  switch (status) {
    case 'Live': return <ShieldCheck size={14} className="mr-1 text-green-500" />;
    case 'featured': return <StarIcon size={14} className="mr-1 text-yellow-500 fill-yellow-500" />;
    case 'User Submitted': return <Users size={14} className="mr-1" />;
    case 'recentlyAdded': return <Hourglass size={14} className="mr-1" />;
    case 'Hide': return <EyeOff size={14} className="mr-1" />;
    case 'archived': return <Archive size={14} className="mr-1" />;
    default: return <InfoIcon size={14} className="mr-1" />;
  }
};


export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [allCultivars, setAllCultivars] = useState<Cultivar[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [selectedGenetics, setSelectedGenetics] = useState<Genetics[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<CultivarStatus[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCultivarIds, setSelectedCultivarIds] = useState<string[]>([]);
  const [isMassUpdating, setIsMassUpdating] = useState(false);
  const { toast } = useToast();

  const allAvailableEffects = EFFECT_OPTIONS;
  const allAvailableFlavors = FLAVOR_OPTIONS;

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/'); 
      } else {
        fetchCultivars();
      }
    }
  }, [user, authLoading, router]);


  const fetchCultivars = useCallback(async () => {
    setIsLoadingData(true);
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
      setIsLoadingData(false);
    }
  }, [toast]);


  const handleEffectToggle = (effect: string) => {
    setSelectedEffects(prev =>
      prev.includes(effect) ? prev.filter(e => e !== effect) : [...prev, effect]
    );
    setCurrentPage(1);
  };

  const handleFlavorToggle = (flavor: string, checked: boolean) => {
    setSelectedFlavors(prev =>
      checked ? [...prev, flavor] : prev.filter(f => f !== flavor)
    );
    setCurrentPage(1);
  };

  const handleGeneticToggle = (genetic: Genetics) => {
    setSelectedGenetics(prev =>
      prev.includes(genetic) ? prev.filter(g => g !== genetic) : [...prev, genetic]
    );
    setCurrentPage(1);
  };

  const handleStatusToggle = (status: CultivarStatus) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
    setCurrentPage(1);
  };

  const handleCultivarStatusChange = useCallback((cultivarId: string, newStatus: CultivarStatus) => {
    setAllCultivars(prevCultivars =>
      prevCultivars.map(c =>
        c.id === cultivarId ? { ...c, status: newStatus } : c
      )
    );
  }, []);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedEffects([]);
    setSelectedFlavors([]);
    setSelectedGenetics([]);
    setSelectedStatuses([]);
    setCurrentPage(1);
  };

  const filteredAndSortedCultivars = useMemo(() => {
    let filtered = allCultivars;

    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(c => c.status && selectedStatuses.includes(c.status));
    }
    
    if (selectedGenetics.length > 0) {
      filtered = filtered.filter(c => selectedGenetics.includes(c.genetics));
    }

    if (searchTerm) {
      filtered = filtered.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (selectedEffects.length > 0) {
      filtered = filtered.filter(c => c.effects && selectedEffects.every(eff => c.effects.includes(eff)));
    }

    if (selectedFlavors.length > 0) {
      filtered = filtered.filter(c => c.flavors && selectedFlavors.every(flav => c.flavors.includes(flav)));
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
  }, [allCultivars, searchTerm, selectedEffects, selectedFlavors, selectedGenetics, selectedStatuses, sortOption]);

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
  
  const handleArchive = async (e: React.MouseEvent, cultivarId: string, cultivarName: string) => {
    e.stopPropagation();
    try {
      await updateCultivarStatus(cultivarId, 'archived');
      toast({
        title: "Cultivar Archived",
        description: `${cultivarName} has been moved to archives.`,
      });
      handleCultivarStatusChange(cultivarId, 'archived');
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to archive ${cultivarName}.`,
        variant: "destructive",
      });
      console.error("Failed to archive cultivar:", error);
    }
  };

  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedCultivarIds(filteredAndSortedCultivars.map(c => c.id));
    } else {
      setSelectedCultivarIds([]);
    }
  };

  const handleSelectRow = (cultivarId: string, checked: boolean) => {
    setSelectedCultivarIds(prev =>
      checked ? [...prev, cultivarId] : prev.filter(id => id !== cultivarId)
    );
  };

  const handleMassStatusUpdate = async (newStatus: CultivarStatus) => {
    if (selectedCultivarIds.length === 0) {
      toast({ title: "No Cultivars Selected", description: "Please select at least one cultivar to update.", variant: "destructive" });
      return;
    }
    setIsMassUpdating(true);
    try {
      await updateMultipleCultivarStatuses(selectedCultivarIds, newStatus);
      toast({
        title: "Status Update Successful",
        description: `${selectedCultivarIds.length} cultivar(s) updated to ${STATUS_LABELS[newStatus]}.`,
      });
      setAllCultivars(prev =>
        prev.map(c =>
          selectedCultivarIds.includes(c.id) ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } : c
        )
      );
      setSelectedCultivarIds([]); // Deselect after action
    } catch (error) {
      console.error("Failed to mass update statuses:", error);
      toast({
        title: "Mass Update Failed",
        description: "Could not update statuses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMassUpdating(false);
    }
  };


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

  if (authLoading || (!user && !authLoading)) { 
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }
  
  if (!user) { 
    return (
       <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <AlertTriangle size={64} className="text-destructive mb-4" />
        <h1 className="text-3xl font-headline text-destructive mb-2">Access Denied</h1>
        <p className="text-muted-foreground font-body mb-6">
          You must be logged in to view the dashboard.
        </p>
        <Link href="/">
          <Button variant="default">Go to Homepage</Button>
        </Link>
      </div>
    );
  }

  const numSelected = selectedCultivarIds.length;
  const allFilteredSelected = filteredAndSortedCultivars.length > 0 && numSelected === filteredAndSortedCultivars.length;
  const someFilteredSelected = numSelected > 0 && numSelected < filteredAndSortedCultivars.length;


  return (
    <div className="space-y-8 animate-fadeIn">
      <section className="bg-card p-6 rounded-lg shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-4">
          <div>
            <h1 className="text-4xl font-headline text-primary">Cultivar Dashboard</h1>
            <p className="text-muted-foreground font-body mt-1">
              Manage and explore your cultivar collection.
            </p>
          </div>
          <Link href="/cultivars/add" passHref>
            <Button variant="default" className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add New Cultivar
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 items-end pt-4">
          <div className="relative lg:col-span-1">
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
          <div></div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <div className="flex items-center text-lg font-semibold">
                <Filter className="mr-2 h-5 w-5 text-primary" />
                Advanced Filters
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Leaf className="mr-2 h-5 w-5 text-primary" />
                    Filter by Genetics:
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {selectedGenetics.length > 0 ? `${selectedGenetics.length} selected` : "Select Genetics"}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      <DropdownMenuLabel>Genetics</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {GENETIC_OPTIONS.map(genetic => (
                        <DropdownMenuCheckboxItem
                          key={genetic}
                          checked={selectedGenetics.includes(genetic)}
                          onCheckedChange={() => handleGeneticToggle(genetic)}
                          onSelect={(e) => e.preventDefault()} 
                        >
                          {genetic}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div>
                   <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
                    Filter by Status:
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {selectedStatuses.length > 0 ? `${selectedStatuses.length} selected` : "Select Statuses"}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      <DropdownMenuLabel>Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {STATUS_OPTIONS_ORDERED.map(status => (
                        <DropdownMenuCheckboxItem
                          key={status}
                          checked={selectedStatuses.includes(status)}
                          onCheckedChange={() => handleStatusToggle(status)}
                          onSelect={(e) => e.preventDefault()}
                        >
                          {STATUS_LABELS[status]}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                 <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Utensils className="mr-2 h-5 w-5 text-primary" />
                    Filter by Flavors:
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                        {selectedFlavors.length > 0 ? `${selectedFlavors.length} selected` : "Select Flavors"}
                        <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                        <DropdownMenuLabel>Flavors</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {allAvailableFlavors.map(flavor => (
                        <DropdownMenuCheckboxItem
                            key={flavor}
                            checked={selectedFlavors.includes(flavor)}
                            onCheckedChange={(checked) => handleFlavorToggle(flavor, !!checked)}
                            onSelect={(e) => e.preventDefault()}
                        >
                            {flavor}
                        </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <ChevronsUpDown className="mr-2 h-5 w-5 text-primary" />
                    Filter by Effects:
                  </h3>
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                        {selectedEffects.length > 0 ? `${selectedEffects.length} selected` : "Select Effects"}
                        <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                        <DropdownMenuLabel>Effects</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {allAvailableEffects.map(effect => (
                        <DropdownMenuCheckboxItem
                            key={effect}
                            checked={selectedEffects.includes(effect)}
                            onCheckedChange={() => handleEffectToggle(effect)}
                            onSelect={(e) => e.preventDefault()}
                        >
                            {effect}
                        </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <Separator className="my-6" />
              <Button onClick={resetFilters} variant="outline" className="w-full sm:w-auto">
                <ListRestart className="mr-2 h-4 w-4" /> Reset All Filters
              </Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {selectedCultivarIds.length > 0 && (
        <div className="bg-primary/10 p-3 rounded-md shadow-md my-4 flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-primary">
            {selectedCultivarIds.length} cultivar(s) selected
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isMassUpdating}>
                {isMassUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckSquare className="mr-2 h-4 w-4" />}
                Change Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Set status to:</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {STATUS_OPTIONS_ORDERED.map((statusOption) => (
                <DropdownMenuItem key={statusOption} onClick={() => handleMassStatusUpdate(statusOption)} disabled={isMassUpdating}>
                  {getStatusIcon(statusOption)}
                  {STATUS_LABELS[statusOption]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {isLoadingData ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Loading cultivars...</p>
        </div>
      ) : paginatedCultivars.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={allFilteredSelected ? true : someFilteredSelected ? "indeterminate" : false}
                      onCheckedChange={(isChecked) => handleSelectAll(isChecked as boolean)}
                      aria-label="Select all cultivars matching current filters"
                    />
                  </TableHead>
                  <TableHead className="w-[64px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Genetics</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>THC (%)</TableHead>
                  <TableHead>CBD (%)</TableHead>
                  <TableHead className="text-right w-[180px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCultivars.map(cultivar => {
                  const isArchivedStatus = cultivar.status === 'archived'; 
                  const isHiddenStatus = cultivar.status === 'Hide';
                  const isDisabledActions = isArchivedStatus || isHiddenStatus;

                  const thcMin = cultivar.thc?.min ?? 'N/A';
                  const thcMax = cultivar.thc?.max ?? 'N/A';
                  const cbdMin = cultivar.cbd?.min ?? 'N/A';
                  const cbdMax = cultivar.cbd?.max ?? 'N/A';
                  const isSelected = selectedCultivarIds.includes(cultivar.id);

                  return (
                    <TableRow 
                      key={cultivar.id} 
                      className={cn(
                        (isArchivedStatus || isHiddenStatus) && "opacity-60 bg-muted/30",
                        isSelected && "bg-primary/5"
                      )}
                      data-state={isSelected ? "selected" : ""}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectRow(cultivar.id, !!checked)}
                          aria-label={`Select cultivar ${cultivar.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        {cultivar.images && cultivar.images.length > 0 ? (
                          <Image
                            src={cultivar.images[0].url}
                            alt={cultivar.images[0].alt}
                            data-ai-hint={cultivar.images[0]['data-ai-hint'] as string}
                            width={40}
                            height={40}
                            className="rounded-md object-cover h-10 w-10"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                            <ImageOff size={20} />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link href={`/cultivars/${cultivar.id}`} className="font-medium text-primary hover:underline">
                          {cultivar.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{cultivar.genetics}</Badge>
                      </TableCell>
                      <TableCell>
                        {cultivar.status && (
                          <Badge 
                            variant={getStatusBadgeVariant(cultivar.status)} 
                            className={cn(
                              "capitalize text-xs flex items-center w-fit", 
                              cultivar.status === 'featured' && "bg-yellow-400/20 border-yellow-500/50 text-yellow-700 dark:text-yellow-300",
                              cultivar.status === 'Hide' && "bg-gray-400/20 border-gray-500/50 text-gray-700 dark:text-gray-300"
                            )}
                          >
                            {getStatusIcon(cultivar.status)}
                            {STATUS_LABELS[cultivar.status]}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {thcMin}{thcMin !== 'N/A' && thcMin !== undefined ? '%' : ''} - {thcMax}{thcMax !== 'N/A' && thcMax !== undefined ? '%' : ''}
                      </TableCell>
                      <TableCell className="text-sm">
                        {cbdMin}{cbdMin !== 'N/A' && cbdMin !== undefined ? '%' : ''} - {cbdMax}{cbdMax !== 'N/A' && cbdMax !== undefined ? '%' : ''}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/cultivars/edit/${cultivar.id}`}>
                            <Button variant="outline" size="sm" disabled={isDisabledActions} aria-label={`Edit ${cultivar.name}`}>
                              <Edit size={14} />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => handleArchive(e, cultivar.id, cultivar.name)}
                            disabled={isArchivedStatus} 
                            aria-label={`Archive ${cultivar.name}`}
                          >
                            <Archive size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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

