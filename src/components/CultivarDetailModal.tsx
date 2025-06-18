
'use client';

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
import { Leaf, Percent, Smile, ThermometerSun, ThermometerSnowflake, Utensils, ImageOff, Network } from 'lucide-react';
import { Separator } from './ui/separator';

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

export default function CultivarDetailModal({ cultivar, isOpen, onOpenChange, cultivarNameMap }: CultivarDetailModalProps) {
  if (!cultivar) {
    return null;
  }

  const averageRating = calculateAverageRating(cultivar.reviews);

  const thcMin = cultivar.thc?.min ?? 'N/A';
  const thcMax = cultivar.thc?.max ?? 'N/A';
  const cbdMin = cultivar.cbd?.min ?? 'N/A';
  const cbdMax = cultivar.cbd?.max ?? 'N/A';

  const hasLineage = (cultivar.parents && cultivar.parents.length > 0) || (cultivar.children && cultivar.children.length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="font-headline text-3xl text-primary flex items-center">
            <Leaf size={30} className="mr-3 text-primary/80" />
            {cultivar.name}
          </DialogTitle>
          <div className="flex items-center space-x-2 pt-1">
            <Badge variant="secondary" className="text-sm">{cultivar.genetics}</Badge>
            {averageRating > 0 && (
              <>
                <StarRating rating={averageRating} readOnly size={20} />
                <span className="text-xs text-muted-foreground">({(cultivar.reviews || []).length} reviews)</span>
              </>
            )}
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-grow overflow-y-auto px-6">
          <div className="space-y-4 pb-6">
            {cultivar.images && cultivar.images.length > 0 ? (
              <div className="relative w-full aspect-video rounded-md overflow-hidden my-4 shadow-md">
                <Image
                  src={cultivar.images[0].url}
                  alt={cultivar.images[0].alt}
                  data-ai-hint={cultivar.images[0]['data-ai-hint'] as string}
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
              {cultivar.description}
            </DialogDescription>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg flex items-center mb-2"><Percent size={20} className="mr-2 text-accent"/>Cannabinoids</h3>
                <p className="text-sm flex items-center gap-1.5">
                  <ThermometerSun size={16} className="text-red-500" /> 
                  THC: {thcMin}{thcMin !== 'N/A' ? '%' : ''} - {thcMax}{thcMax !== 'N/A' ? '%' : ''}
                </p>
                <p className="text-sm flex items-center gap-1.5">
                  <ThermometerSnowflake size={16} className="text-blue-500" />
                  CBD: {cbdMin}{cbdMin !== 'N/A' ? '%' : ''} - {cbdMax}{cbdMax !== 'N/A' ? '%' : ''}
                </p>
              </div>

              {cultivar.effects && cultivar.effects.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg flex items-center mb-2"><Smile size={20} className="mr-2 text-accent"/>Effects</h3>
                  <div className="flex flex-wrap gap-1">
                    {cultivar.effects.slice(0, 5).map(effect => (
                      <Badge key={effect} variant="outline" className="bg-accent/10 border-accent/30 text-black">{effect}</Badge>
                    ))}
                    {cultivar.effects.length > 5 && <Badge variant="outline">...</Badge>}
                  </div>
                </div>
              )}
            </div>
            
            {cultivar.flavors && cultivar.flavors.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg flex items-center mb-2"><Utensils size={20} className="mr-2 text-accent"/>Flavors</h3>
                  <div className="flex flex-wrap gap-1">
                    {cultivar.flavors.slice(0, 5).map(flavor => (
                      <Badge key={flavor} variant="outline" className="bg-primary/10 border-primary/30 text-foreground/90">{flavor}</Badge>
                    ))}
                    {cultivar.flavors.length > 5 && <Badge variant="outline">...</Badge>}
                  </div>
                </div>
              )}
            
            {hasLineage && (
              <div className="pt-2">
                <Separator className="my-3"/>
                <h3 className="font-semibold text-lg flex items-center mb-2">
                  <Network size={20} className="mr-2 text-accent" />Lineage
                </h3>
                <div className="text-sm space-y-2">
                  {cultivar.parents && cultivar.parents.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1">Parents</h4>
                      <div className="flex flex-wrap gap-1">
                        {cultivar.parents.map((parentName, index) => (
                          <Badge key={`parent-${index}`} variant="outline" className="text-xs">
                            {parentName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                   {cultivar.name && (
                    <div className="my-1">
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1">Current</h4>
                        <Badge variant="secondary" className="text-xs bg-primary/20 border-primary/40">
                            {cultivar.name}
                        </Badge>
                    </div>
                  )}
                  {cultivar.children && cultivar.children.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1">Children</h4>
                      <div className="flex flex-wrap gap-1">
                        {cultivar.children.map((childName, index) => (
                          <Badge key={`child-${index}`} variant="outline" className="text-xs">
                            {childName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {cultivar.supplierUrl && (
                 <div className="pt-2">
                    <a href={cultivar.supplierUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:text-accent font-medium transition-colors">
                        Visit Supplier Website
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
