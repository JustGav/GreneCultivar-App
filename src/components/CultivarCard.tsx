
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import type { Cultivar, CultivarStatus } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StarRating from './StarRating';
import { Leaf, ThermometerSnowflake, ThermometerSun, Edit, Archive, CheckCheck, ShieldCheck, Hourglass, Info, Utensils, Palette, Star as StarIcon, Users, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { updateCultivarStatus } from '@/services/firebase';
import { cn } from '@/lib/utils';

interface CultivarCardProps {
  cultivar: Cultivar;
  onStatusChange?: (cultivarId: string, newStatus: CultivarStatus) => void;
  isPublicView?: boolean;
  onViewInModal?: (cultivar: Cultivar) => void;
}

function calculateAverageRating(reviews: Cultivar['reviews']): number {
  if (!reviews || reviews.length === 0) return 0;
  const total = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
}

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
  if (!status) return <Info size={14} className="mr-1" />;
  switch (status) {
    case 'Live': return <ShieldCheck size={14} className="mr-1 text-green-500" />;
    case 'featured': return <StarIcon size={14} className="mr-1 text-yellow-500 fill-yellow-500" />;
    case 'User Submitted': return <Users size={14} className="mr-1" />;
    case 'recentlyAdded': return <Hourglass size={14} className="mr-1" />;
    case 'Hide': return <EyeOff size={14} className="mr-1" />;
    case 'archived': return <Archive size={14} className="mr-1" />;
    default: return <Info size={14} className="mr-1" />;
  }
};


export default function CultivarCard({ cultivar, onStatusChange, isPublicView = false, onViewInModal }: CultivarCardProps) {
  const averageRating = calculateAverageRating(cultivar.reviews);
  const { toast } = useToast();
  const [isArchiving, setIsArchiving] = useState(false);

  const handleArchive = async () => {
    setIsArchiving(true);
    try {
      await updateCultivarStatus(cultivar.id, 'archived');
      toast({
        title: "Cultivar Archived",
        description: `${cultivar.name} has been moved to archives.`,
      });
      if (onStatusChange) {
        onStatusChange(cultivar.id, 'archived');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to archive ${cultivar.name}.`,
        variant: "destructive",
      });
      console.error("Failed to archive cultivar:", error);
    } finally {
      setIsArchiving(false);
    }
  };

  const isArchived = cultivar.status === 'archived';
  const isHidden = cultivar.status === 'Hide';

  const thcMin = cultivar.thc?.min ?? 'N/A';
  const thcMax = cultivar.thc?.max ?? 'N/A';
  const cbdMin = cultivar.cbd?.min ?? 'N/A';
  const cbdMax = cultivar.cbd?.max ?? 'N/A';

  const hasImages = cultivar.images && cultivar.images.length > 0;
  const isOverlayStatusType = cultivar.status === 'recentlyAdded' || cultivar.status === 'featured' || cultivar.status === 'User Submitted';

  let showTitleAdjacentBadge = false;
  if (cultivar.status) {
      if (cultivar.status === 'Live' && !isPublicView) {
          showTitleAdjacentBadge = true;
      } else if (cultivar.status === 'Archived' || cultivar.status === 'Hide') {
          showTitleAdjacentBadge = true;
      } else if (isOverlayStatusType && !hasImages) {
          showTitleAdjacentBadge = true;
      }
  }

  return (
    <Card
        className={cn(
            "flex flex-col h-full hover:shadow-xl transition-shadow duration-300 ease-in-out animate-fadeIn group",
            (isArchived || isHidden) && "opacity-60 bg-muted/50",
            isPublicView && "cursor-pointer"
        )}
        onClick={isPublicView && onViewInModal ? () => onViewInModal(cultivar) : undefined}
        role={isPublicView ? "button" : undefined}
        tabIndex={isPublicView ? 0 : undefined}
        onKeyDown={isPublicView && onViewInModal ? (e) => { if (e.key === 'Enter' || e.key === ' ') onViewInModal(cultivar) } : undefined}
    >
      <CardHeader>
        {hasImages && (
          <div className="relative w-full h-48 mb-4 rounded-t-lg overflow-hidden">
            <Image
              src={cultivar.images[0].url}
              alt={cultivar.images[0].alt}
              data-ai-hint={cultivar.images[0]['data-ai-hint'] as string}
              fill
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {isOverlayStatusType && ( // Only show overlay if it's an overlay type AND there are images
              <Badge
                variant={getStatusBadgeVariant(cultivar.status)}
                className={cn(
                  "absolute top-2 right-2 z-10 capitalize flex items-center text-xs h-fit py-1 px-2 shadow-md",
                  cultivar.status === 'featured' && "bg-yellow-400/80 border-yellow-500/70 text-yellow-900 dark:text-yellow-900"
                )}
              >
                {getStatusIcon(cultivar.status)}
                {STATUS_LABELS[cultivar.status as CultivarStatus]}
              </Badge>
            )}
          </div>
        )}
        <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-2xl text-primary">{cultivar.name}</CardTitle>
            {showTitleAdjacentBadge && cultivar.status && (
                <Badge
                  variant={getStatusBadgeVariant(cultivar.status)}
                  className={cn(
                      "capitalize flex items-center text-xs h-fit py-1 px-1.5",
                      (cultivar.status === 'featured') && "bg-yellow-400/80 border-yellow-500/70 text-yellow-900 dark:text-yellow-900", // Apply featured style if shown here
                      cultivar.status === 'Hide' && "bg-gray-400/20 border-gray-500/50 text-gray-700 dark:text-gray-300"
                    )}
                >
                    {getStatusIcon(cultivar.status)}
                    {STATUS_LABELS[cultivar.status as CultivarStatus]}
                </Badge>
            )}
        </div>
        <CardDescription className="flex items-center gap-2">
          <Leaf size={16} className="text-primary" />
          <span>{cultivar.genetics}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <ThermometerSun size={16} className="text-red-500" />
            <span>THC: {thcMin}{thcMin !== 'N/A' && thcMin !== undefined && thcMin !== 0 ? '%' : ''} - {thcMax}{thcMax !== 'N/A' && thcMax !== undefined && thcMax !== 0 ? '%' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <ThermometerSnowflake size={16} className="text-blue-500" />
            <span>CBD: {cbdMin}{cbdMin !== 'N/A' && cbdMin !== undefined && cbdMin !== 0 ? '%' : ''} - {cbdMax}{cbdMax !== 'N/A' && cbdMax !== undefined && cbdMax !== 0 ? '%' : ''}</span>
          </div>
          <div className="mt-2">
            <h4 className="font-semibold text-muted-foreground">Effects:</h4>
            <div className="flex flex-wrap gap-1 mt-1">
              {cultivar.effects && cultivar.effects.slice(0, 3).map(effect => (
                <Badge key={effect} variant="secondary" className="bg-accent/20 text-foreground">{effect}</Badge>
              ))}
              {cultivar.effects && cultivar.effects.length > 3 && <Badge variant="outline">...</Badge>}
            </div>
          </div>
          {cultivar.flavors && cultivar.flavors.length > 0 && (
            <div className="mt-2">
              <h4 className="font-semibold text-muted-foreground flex items-center"><Utensils size={14} className="mr-1.5 text-primary/70" />Flavors:</h4>
              <div className="flex flex-wrap gap-1 mt-1">
                {cultivar.flavors.slice(0, 3).map(flavor => (
                  <Badge key={flavor} variant="secondary" className="bg-primary/10 border-primary/20 text-foreground">{flavor}</Badge>
                ))}
                {cultivar.flavors.length > 3 && <Badge variant="outline">...</Badge>}
              </div>
            </div>
          )}
           {cultivar.terpeneProfile && cultivar.terpeneProfile.length > 0 && (
            <div className="mt-2">
              <h4 className="font-semibold text-muted-foreground flex items-center"><Palette size={14} className="mr-1.5 text-accent/90" />Terpenes:</h4>
              <div className="flex flex-wrap gap-1 mt-1">
                {cultivar.terpeneProfile.slice(0, 3).map(terpene => (
                  <Badge key={terpene.id} variant="outline" className="bg-blue-500/10 border-blue-500/30 text-foreground">
                    {terpene.name}
                    {terpene.percentage && terpene.percentage > 0 ? (
                      <span className="ml-1 text-xs opacity-75">({terpene.percentage}%)</span>
                    ) : null}
                  </Badge>
                ))}
                {cultivar.terpeneProfile.length > 3 && <Badge variant="outline">...</Badge>}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 pt-4 border-t">
        <div className="flex items-center justify-between w-full">
           <StarRating rating={averageRating} readOnly size={20} />
           {averageRating > 0 && <span className="text-sm text-muted-foreground ml-2">({(cultivar.reviews || []).length} reviews)</span>}
        </div>
        <div className={cn("grid grid-cols-1 gap-2 w-full", isPublicView ? "" : "sm:grid-cols-3")}>
          {isPublicView ? (
            null
          ) : (
            <>
              <Link href={`/cultivars/${cultivar.id}`} className="w-full" aria-label={`View full details for ${cultivar.name}`}>
                <Button variant="default" className="w-full text-sm" disabled={isArchived || isHidden}>
                  View Details
                </Button>
              </Link>
              <Link href={`/cultivars/edit/${cultivar.id}`} className="w-full" aria-label={`Edit ${cultivar.name}`}>
                <Button variant="outline" className="w-full text-sm" disabled={isArchived || isHidden}>
                  <Edit size={16} className="mr-2" /> Edit
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full text-sm text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                onClick={handleArchive}
                disabled={isArchived || isArchiving}
                aria-label={`Archive ${cultivar.name}`}
              >
                <Archive size={16} className="mr-2" /> {isArchiving ? 'Archiving...' : 'Archive'}
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

