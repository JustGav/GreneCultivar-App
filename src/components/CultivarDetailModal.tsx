
'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Cultivar, CultivarStatus } from '@/types';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StarRating from './StarRating';
import { Leaf, Percent, Smile, ThermometerSun, ThermometerSnowflake, Utensils, ImageOff, Network, ExternalLink, Palette, Loader2, ArrowLeft } from 'lucide-react';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import { getCultivarById } from '@/services/firebase';
import { useToast } from '@/hooks/use-toast';
import type { CultivarInfoForMap } from '@/app/page';


interface CultivarDetailModalProps {
  cultivar: Cultivar | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  cultivarInfoMap?: Map<string, CultivarInfoForMap>;
}

const calculateAverageRating = (reviews: Cultivar['reviews'] = []): number => {
  if (!reviews || reviews.length === 0) return 0;
  const total = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
};

const NEGATIVE_EFFECTS_MODAL = ['Dry Mouth', 'Dry Eyes', 'Paranoid', 'Anxious', 'Dizzy'];

export default function CultivarDetailModal({ cultivar: initialCultivar, isOpen, onOpenChange, cultivarInfoMap }: CultivarDetailModalProps) {
  const [displayedCultivarData, setDisplayedCultivarData] = useState<Cultivar | null>(null);
  const [isLoadingLineage, setIsLoadingLineage] = useState(false);
  const [historyStack, setHistoryStack] = useState<Cultivar[]>([]);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialCultivar) {
        setDisplayedCultivarData(initialCultivar);
        setHistoryStack([initialCultivar]);
        setIsLoadingLineage(false);
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTo({ top: 0 });
        }
    } else if (isOpen && !initialCultivar) {
        // This case is managed by the parent - modal won't open if initialCultivar is null
    }
  }, [initialCultivar, isOpen]);


  useEffect(() => {
    if (isOpen && !displayedCultivarData && !isLoadingLineage && historyStack.length === 0) {
      onOpenChange(false);
    }
  }, [isOpen, displayedCultivarData, isLoadingLineage, onOpenChange, historyStack]);


  const handleLineageItemClick = useCallback(async (cultivarId: string) => {
    if (!cultivarId) return;
    setIsLoadingLineage(true);
    try {
      const newCultivarData = await getCultivarById(cultivarId);
      if (newCultivarData) {
        setDisplayedCultivarData(newCultivarData);
        setHistoryStack(prev => [...prev, newCultivarData]);
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTo({ top: 0 });
        }
      } else {
        toast({
          title: "Cultivar Not Found",
          description: "Could not load details for the selected cultivar.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching lineage cultivar:", error);
      toast({
        title: "Error",
        description: "Failed to load cultivar details.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLineage(false);
    }
  }, [toast]);

  const handleBackClick = () => {
    if (historyStack.length > 1) {
      const newHistoryStack = historyStack.slice(0, -1);
      setHistoryStack(newHistoryStack);
      setDisplayedCultivarData(newHistoryStack[newHistoryStack.length - 1]);
      if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTo({ top: 0 });
        }
    }
  };

  const { effectiveParents, effectiveChildren } = useMemo(() => {
    if (!displayedCultivarData || !cultivarInfoMap) {
      return { effectiveParents: [], effectiveChildren: [] };
    }

    const currentCultivarName = displayedCultivarData.name;
    let parentsSet = new Set<string>(displayedCultivarData.parents || []);
    let childrenSet = new Set<string>(displayedCultivarData.children || []);

    for (const [name, info] of cultivarInfoMap.entries()) {
      if (name.toLowerCase() === currentCultivarName.toLowerCase()) continue;

      if (info.children?.includes(currentCultivarName)) {
        parentsSet.add(info.name);
      }
      if (info.parents?.includes(currentCultivarName)) {
        childrenSet.add(info.name);
      }
    }
    return {
      effectiveParents: Array.from(parentsSet),
      effectiveChildren: Array.from(childrenSet),
    };
  }, [displayedCultivarData, cultivarInfoMap]);


  if (!displayedCultivarData && !isLoadingLineage) {
    return null;
  }

  const averageRating = calculateAverageRating(displayedCultivarData?.reviews);
  const thcMin = displayedCultivarData?.thc?.min ?? 'N/A';
  const thcMax = displayedCultivarData?.thc?.max ?? 'N/A';
  const cbdMin = displayedCultivarData?.cbd?.min ?? 'N/A';
  const cbdMax = displayedCultivarData?.cbd?.max ?? 'N/A';
  const hasLineageData = effectiveParents.length > 0 || effectiveChildren.length > 0;


  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setHistoryStack([]); // Reset history when modal closes
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
        {isLoadingLineage && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}
        {displayedCultivarData && (
          <>
            <DialogHeader className="p-6 pb-2 flex flex-row items-center space-x-3">
              {historyStack.length > 1 && (
                <Button variant="ghost" size="icon" onClick={handleBackClick} className="mr-1 flex-shrink-0" aria-label="Go back to previous cultivar in modal">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <div className={cn("flex-grow", historyStack.length <=1 && "pl-9")}> {/* Adjust padding if no back button */}
                <DialogTitle className="font-headline text-3xl text-primary flex items-center">
                  <Leaf size={30} className="mr-3 text-primary/80 flex-shrink-0" />
                  <span className="truncate">{displayedCultivarData.name}</span>
                </DialogTitle>
                <div className="flex items-center space-x-2 pt-1">
                  <Badge variant="secondary" className="text-sm">{displayedCultivarData.genetics}</Badge>
                  {averageRating > 0 && (
                    <>
                      <StarRating rating={averageRating} readOnly size={20} />
                      <span className="text-xs text-muted-foreground">({(displayedCultivarData.reviews || []).length} reviews)</span>
                    </>
                  )}
                </div>
              </div>
            </DialogHeader>

            <ScrollArea ref={scrollAreaRef} className="flex-grow overflow-y-auto px-6">
              <div key={displayedCultivarData.id} className="space-y-4 pb-6"> {/* Unique key for re-render on data change */}
                {displayedCultivarData.images && displayedCultivarData.images.length > 0 ? (
                  <div className="relative w-full aspect-video rounded-md overflow-hidden my-4 shadow-md">
                    <Image
                      src={displayedCultivarData.images[0].url}
                      alt={displayedCultivarData.images[0].alt}
                      data-ai-hint={displayedCultivarData.images[0]['data-ai-hint'] as string}
                      fill
                      style={{ objectFit: 'cover' }}
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted flex flex-col items-center justify-center text-muted-foreground p-6 rounded-md my-4">
                    <ImageOff size={40} className="mb-2" />
                    <p className="text-md font-semibold">No Image Available</p>
                  </div>
                )}

                <DialogDescription className="text-md font-body text-foreground/90 leading-relaxed">
                  {displayedCultivarData.description}
                </DialogDescription>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center mb-2"><Percent size={20} className="mr-2 text-accent"/>Cannabinoids</h3>
                    <p className="text-sm flex items-center gap-1.5">
                      <ThermometerSun size={16} className="text-red-500" />
                      THC: {thcMin}{thcMin !== 'N/A' && thcMin !== undefined && thcMin !== 0 ? '%' : ''} - {thcMax}{thcMax !== 'N/A' && thcMax !== undefined && thcMax !== 0 ? '%' : ''}
                    </p>
                    <p className="text-sm flex items-center gap-1.5">
                      <ThermometerSnowflake size={16} className="text-blue-500" />
                      CBD: {cbdMin}{cbdMin !== 'N/A' && cbdMin !== undefined && cbdMin !== 0 ? '%' : ''} - {cbdMax}{cbdMax !== 'N/A' && cbdMax !== undefined && cbdMax !== 0 ? '%' : ''}
                    </p>
                  </div>

                  {displayedCultivarData.effects && displayedCultivarData.effects.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg flex items-center mb-2"><Smile size={20} className="mr-2 text-accent"/>Effects</h3>
                      <div className="flex flex-wrap gap-1">
                        {displayedCultivarData.effects.slice(0, 5).map(effect => {
                           const isNegative = NEGATIVE_EFFECTS_MODAL.includes(effect);
                           return (
                            <Badge
                              key={effect}
                              className={cn(
                                "text-black", // Base text color
                                isNegative
                                  ? 'bg-destructive/10 border-destructive/30' // Destructive for negative
                                  : 'bg-primary/10 border-primary/30' // Primary for positive/neutral
                              )}
                            >
                              {effect}
                            </Badge>
                          );
                        })}
                        {displayedCultivarData.effects.length > 5 && <Badge variant="outline">...</Badge>}
                      </div>
                    </div>
                  )}
                </div>

                {displayedCultivarData.flavors && displayedCultivarData.flavors.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg flex items-center mb-2"><Utensils size={20} className="mr-2 text-accent"/>Flavors</h3>
                      <div className="flex flex-wrap gap-1">
                        {displayedCultivarData.flavors.slice(0, 5).map(flavor => (
                          <Badge key={flavor} variant="outline" className="bg-primary/5 border-primary/20 text-foreground/90">{flavor}</Badge>
                        ))}
                        {displayedCultivarData.flavors.length > 5 && <Badge variant="outline">...</Badge>}
                      </div>
                    </div>
                  )}

                {displayedCultivarData.terpeneProfile && displayedCultivarData.terpeneProfile.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg flex items-center mb-2">
                      <Palette size={20} className="mr-2 text-accent" />
                      Terpenes
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {displayedCultivarData.terpeneProfile.slice(0, 5).map(terpene => (
                        <Badge key={terpene.id} variant="outline" className="bg-blue-500/10 border-blue-500/30 text-foreground">
                          {terpene.name}
                          {terpene.percentage && terpene.percentage > 0 && (
                            <span className="ml-1 text-xs opacity-75">({terpene.percentage}%)</span>
                          )}
                        </Badge>
                      ))}
                      {displayedCultivarData.terpeneProfile.length > 5 && <Badge variant="outline">...</Badge>}
                    </div>
                  </div>
                )}

                {hasLineageData && (
                  <div className="pt-2">
                    <Separator className="my-3"/>
                    <h3 className="font-semibold text-lg flex items-center mb-3">
                      <Network size={20} className="mr-2 text-accent" />Lineage
                    </h3>
                    <div className="text-center space-y-3">
                      {effectiveParents.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-semibold text-muted-foreground mb-2">Parents</h4>
                          <div className="flex justify-center items-center space-x-3 flex-wrap gap-y-2">
                            {effectiveParents.map((parentName, index) => {
                              const parentInfo = cultivarInfoMap?.get(parentName.toLowerCase());
                              const isLinkable = parentInfo && (parentInfo.status === 'Live' || parentInfo.status === 'featured');
                              return (
                                <Badge
                                  key={`parent-${index}-${parentName}`}
                                  variant="outline"
                                  className={cn("text-xs", isLinkable ? "cursor-pointer hover:bg-accent/20 hover:border-accent/50" : "bg-muted/50 text-muted-foreground/80")}
                                  onClick={isLinkable && parentInfo ? () => handleLineageItemClick(parentInfo.id) : undefined}
                                  role={isLinkable ? "button" : undefined}
                                  tabIndex={isLinkable ? 0 : -1}
                                  onKeyDown={isLinkable && parentInfo ? (e) => { if ((e.key === 'Enter' || e.key === ' ') && parentInfo) handleLineageItemClick(parentInfo.id); } : undefined}
                                >
                                  {parentName}
                                </Badge>
                              );
                            })}
                          </div>
                          <div className="flex justify-center mt-2">
                            <div className="w-px h-4 bg-border"></div>
                          </div>
                        </div>
                      )}

                      <div className="p-3 border-2 border-primary rounded-lg shadow-md bg-primary/10 inline-block">
                        <h3 className="text-md font-semibold text-primary">{displayedCultivarData.name}</h3>
                        <p className="text-xs text-muted-foreground">Current Cultivar</p>
                      </div>

                      {effectiveChildren.length > 0 && (
                        <div className="mt-3">
                          <div className="flex justify-center mb-2">
                            <div className="w-px h-4 bg-border"></div>
                          </div>
                          <h4 className="text-sm font-semibold text-muted-foreground mb-2">Children</h4>
                          <div className="flex justify-center items-center space-x-3 flex-wrap gap-y-2">
                            {effectiveChildren.map((childName, index) => {
                              const childInfo = cultivarInfoMap?.get(childName.toLowerCase());
                              const isLinkable = childInfo && (childInfo.status === 'Live' || childInfo.status === 'featured');
                              return (
                                 <Badge
                                  key={`child-${index}-${childName}`}
                                  variant="outline"
                                  className={cn("text-xs", isLinkable ? "cursor-pointer hover:bg-accent/20 hover:border-accent/50" : "bg-muted/50 text-muted-foreground/80")}
                                  onClick={isLinkable && childInfo ? () => handleLineageItemClick(childInfo.id) : undefined}
                                  role={isLinkable ? "button" : undefined}
                                  tabIndex={isLinkable ? 0 : -1}
                                  onKeyDown={isLinkable && childInfo ? (e) => { if ((e.key === 'Enter' || e.key === ' ') && childInfo) handleLineageItemClick(childInfo.id); } : undefined}
                                >
                                  {childName}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {effectiveParents.length === 0 && effectiveChildren.length === 0 && (
                        <p className="text-muted-foreground text-sm pt-2">No specific parent/child lineage information available.</p>
                      )}
                    </div>
                  </div>
                )}

                {displayedCultivarData.supplierUrl && (
                    <div className="pt-3 mt-3 border-t">
                        <a href={displayedCultivarData.supplierUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm text-primary hover:text-accent font-medium transition-colors">
                            <ExternalLink size={14} className="mr-1.5" /> Visit Supplier Website
                        </a>
                    </div>
                )}
              </div>
            </ScrollArea>

            <DialogFooter className="p-6 pt-2 border-t">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Close
                </Button>
              </DialogClose>
              {displayedCultivarData.id && (
                <a href={`/cultivars/${displayedCultivarData.id}`} target="_blank" rel="noopener noreferrer">
                  <Button type="button" variant="default">
                    View Full Details
                  </Button>
                </a>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
