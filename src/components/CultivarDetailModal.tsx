
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Cultivar } from '@/types';
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
import { Leaf, Percent, Smile, ThermometerSun, ThermometerSnowflake, Utensils, ImageOff, Network, ExternalLink, Palette, Loader2 } from 'lucide-react';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import { getCultivarById } from '@/services/firebase';
import { useToast } from '@/hooks/use-toast';


interface CultivarDetailModalProps {
  cultivar: Cultivar | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  cultivarNameMap?: Map<string, string>;
}

const calculateAverageRating = (reviews: Cultivar['reviews'] = []): number => {
  if (!reviews || reviews.length === 0) return 0;
  const total = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
};

const NEGATIVE_EFFECTS_MODAL = ['Dry Mouth', 'Dry Eyes', 'Paranoid', 'Anxious', 'Dizzy'];

export default function CultivarDetailModal({ cultivar: initialCultivar, isOpen, onOpenChange, cultivarNameMap }: CultivarDetailModalProps) {
  const [displayedCultivarData, setDisplayedCultivarData] = useState<Cultivar | null>(initialCultivar);
  const [isLoadingLineage, setIsLoadingLineage] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setDisplayedCultivarData(initialCultivar);
    setIsLoadingLineage(false);
  }, [initialCultivar, isOpen]);

  const handleLineageItemClick = useCallback(async (cultivarId: string) => {
    if (!cultivarId) return;
    setIsLoadingLineage(true);
    try {
      const newCultivarData = await getCultivarById(cultivarId);
      if (newCultivarData) {
        setDisplayedCultivarData(newCultivarData);
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

  useEffect(() => {
    // If the modal is open, but we have no data and are not loading any,
    // it means something went wrong or the initial cultivar was null.
    // In this case, we should close the modal.
    if (isOpen && !displayedCultivarData && !isLoadingLineage) {
      onOpenChange(false);
    }
  }, [isOpen, displayedCultivarData, isLoadingLineage, onOpenChange]);


  if (!displayedCultivarData && !isLoadingLineage) {
    return null; // Don't render anything if no data and not loading
  }

  const averageRating = calculateAverageRating(displayedCultivarData?.reviews);
  const thcMin = displayedCultivarData?.thc?.min ?? 'N/A';
  const thcMax = displayedCultivarData?.thc?.max ?? 'N/A';
  const cbdMin = displayedCultivarData?.cbd?.min ?? 'N/A';
  const cbdMax = displayedCultivarData?.cbd?.max ?? 'N/A';
  const hasLineageData = (displayedCultivarData?.parents && displayedCultivarData.parents.length > 0) || (displayedCultivarData?.children && displayedCultivarData.children.length > 0);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
        {isLoadingLineage && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}
        {displayedCultivarData && (
          <>
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="font-headline text-3xl text-primary flex items-center">
                <Leaf size={30} className="mr-3 text-primary/80" />
                {displayedCultivarData.name}
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
            </DialogHeader>

            <ScrollArea className="flex-grow overflow-y-auto px-6">
              <div key={displayedCultivarData.id} className="space-y-4 pb-6">
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
                      THC: {thcMin}{thcMin !== 'N/A' && thcMin !== 0 ? '%' : ''} - {thcMax}{thcMax !== 'N/A' && thcMax !== 0 ? '%' : ''}
                    </p>
                    <p className="text-sm flex items-center gap-1.5">
                      <ThermometerSnowflake size={16} className="text-blue-500" />
                      CBD: {cbdMin}{cbdMin !== 'N/A' && cbdMin !== 0 ? '%' : ''} - {cbdMax}{cbdMax !== 'N/A' && cbdMax !== 0 ? '%' : ''}
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
                                "text-black", // Base text color, can adjust
                                isNegative
                                  ? 'bg-destructive/10 border-destructive/30'
                                  : 'bg-primary/10 border-primary/30'
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
                      {displayedCultivarData.parents && displayedCultivarData.parents.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-semibold text-muted-foreground mb-2">Parents</h4>
                          <div className="flex justify-center items-center space-x-3 flex-wrap gap-y-2">
                            {displayedCultivarData.parents.map((parentName, index) => {
                              const parentId = cultivarNameMap?.get(parentName.toLowerCase());
                              return (
                                <Button
                                  key={`parent-${index}`}
                                  variant="link"
                                  className="p-0 h-auto text-xs hover:no-underline"
                                  onClick={() => parentId && handleLineageItemClick(parentId)}
                                  disabled={isLoadingLineage || !parentId}
                                >
                                  <Badge variant="outline" className={cn("text-xs hover:bg-accent/20 hover:border-accent/50", parentId && "cursor-pointer")}>
                                    {parentName}
                                  </Badge>
                                </Button>
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

                      {displayedCultivarData.children && displayedCultivarData.children.length > 0 && (
                        <div className="mt-3">
                          <div className="flex justify-center mb-2">
                            <div className="w-px h-4 bg-border"></div>
                          </div>
                          <h4 className="text-sm font-semibold text-muted-foreground mb-2">Children</h4>
                          <div className="flex justify-center items-center space-x-3 flex-wrap gap-y-2">
                            {displayedCultivarData.children.map((childName, index) => {
                              const childId = cultivarNameMap?.get(childName.toLowerCase());
                              return (
                                <Button
                                  key={`child-${index}`}
                                  variant="link"
                                  className="p-0 h-auto text-xs hover:no-underline"
                                  onClick={() => childId && handleLineageItemClick(childId)}
                                  disabled={isLoadingLineage || !childId}
                                >
                                  <Badge variant="outline" className={cn("text-xs hover:bg-accent/20 hover:border-accent/50", childId && "cursor-pointer")}>
                                    {childName}
                                  </Badge>
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {(!displayedCultivarData.parents || displayedCultivarData.parents.length === 0) && (!displayedCultivarData.children || displayedCultivarData.children.length === 0) && (
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
              {/* Ensure we have displayedCultivarData before creating link */}
              {displayedCultivarData.id && (
                <a href={`/cultivars/${displayedCultivarData.id}`} target="_blank" rel="noopener noreferrer">
                  <Button type="button" variant="default" onClick={() => onOpenChange(false)}>
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

