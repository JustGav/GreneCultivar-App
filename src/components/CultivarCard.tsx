
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import type { Cultivar, CultivarStatus } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StarRating from './StarRating';
import { Leaf, ThermometerSnowflake, ThermometerSun, Edit, Archive, CheckCheck, ShieldCheck, Hourglass, Info } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { updateCultivarStatus } from '@/services/firebase';
import { cn } from '@/lib/utils';

interface CultivarCardProps {
  cultivar: Cultivar;
  onStatusChange?: (cultivarId: string, newStatus: CultivarStatus) => void;
}

function calculateAverageRating(reviews: Cultivar['reviews']): number {
  if (!reviews || reviews.length === 0) return 0;
  const total = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10; 
}

const getStatusBadgeVariant = (status: CultivarStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'verified':
      return 'default'; // Primary color (green)
    case 'recentlyAdded':
      return 'secondary'; // Secondary color
    case 'archived':
      return 'destructive'; // Destructive color (red)
    default:
      return 'outline';
  }
};

const getStatusIcon = (status: CultivarStatus) => {
  switch (status) {
    case 'verified':
      return <ShieldCheck size={14} className="mr-1" />;
    case 'recentlyAdded':
      return <Hourglass size={14} className="mr-1" />;
    case 'archived':
      return <Archive size={14} className="mr-1" />;
    default:
      return <Info size={14} className="mr-1" />;
  }
};

const STATUS_LABELS: Record<CultivarStatus, string> = {
  recentlyAdded: 'Recently Added',
  verified: 'Verified',
  archived: 'Archived',
};


export default function CultivarCard({ cultivar, onStatusChange }: CultivarCardProps) {
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

  return (
    <Card className={cn(
        "flex flex-col h-full hover:shadow-xl transition-shadow duration-300 ease-in-out animate-fadeIn",
        isArchived && "opacity-60 bg-muted/50"
      )}
    >
      <CardHeader>
        {cultivar.images.length > 0 && (
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
          </div>
        )}
        <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-2xl text-primary">{cultivar.name}</CardTitle>
            <Badge variant={getStatusBadgeVariant(cultivar.status)} className="capitalize flex items-center text-xs h-fit">
                {getStatusIcon(cultivar.status)}
                {STATUS_LABELS[cultivar.status]}
            </Badge>
        </div>
        <CardDescription className="flex items-center gap-2">
          <Leaf size={16} className="text-primary" />
          <span>{cultivar.genetics}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <ThermometerSun size={16} className="text-red-500" /> 
            <span>THC: {cultivar.thc.min}% - {cultivar.thc.max}%</span>
          </div>
          <div className="flex items-center gap-2">
            <ThermometerSnowflake size={16} className="text-blue-500" />
            <span>CBD: {cultivar.cbd.min}% - {cultivar.cbd.max}%</span>
          </div>
          <div className="mt-2">
            <h4 className="font-semibold text-muted-foreground">Effects:</h4>
            <div className="flex flex-wrap gap-1 mt-1">
              {cultivar.effects.slice(0, 3).map(effect => (
                <Badge key={effect} variant="secondary" className="bg-accent/20 text-accent-foreground/80">{effect}</Badge>
              ))}
              {cultivar.effects.length > 3 && <Badge variant="outline">...</Badge>}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 pt-4 border-t">
        <div className="flex items-center justify-between w-full">
           <StarRating rating={averageRating} readOnly size={20} />
           {averageRating > 0 && <span className="text-sm text-muted-foreground ml-2">({(cultivar.reviews || []).length} reviews)</span>}
        </div>
        <div className="grid grid-cols-1 gap-2 w-full sm:grid-cols-3">
          <Link href={`/cultivars/${cultivar.id}`} className="w-full">
            <Button variant="default" className="w-full text-sm" disabled={isArchived}>
              View Details
            </Button>
          </Link>
          <Link href={`/cultivars/edit/${cultivar.id}`} className="w-full">
            <Button variant="outline" className="w-full text-sm" disabled={isArchived}>
              <Edit size={16} className="mr-2" /> Edit
            </Button>
          </Link>
           <Button 
            variant="outline" 
            className="w-full text-sm text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
            onClick={handleArchive}
            disabled={isArchived || isArchiving}
          >
            <Archive size={16} className="mr-2" /> {isArchiving ? 'Archiving...' : 'Archive'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
