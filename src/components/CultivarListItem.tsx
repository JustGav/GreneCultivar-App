
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import type { Cultivar, CultivarStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Archive, ShieldCheck, Hourglass, Info, ThermometerSun, ThermometerSnowflake, ImageOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateCultivarStatus } from '@/services/firebase';
import { cn } from '@/lib/utils';

interface CultivarListItemProps {
  cultivar: Cultivar;
  onStatusChange?: (cultivarId: string, newStatus: CultivarStatus) => void;
}

const getStatusBadgeVariant = (status?: CultivarStatus): "default" | "secondary" | "destructive" | "outline" => {
  if (!status) return 'outline';
  switch (status) {
    case 'verified': return 'default';
    case 'recentlyAdded': return 'secondary';
    case 'archived': return 'destructive';
    default: return 'outline';
  }
};

const getStatusIcon = (status?: CultivarStatus) => {
  if (!status) return <Info size={14} className="mr-1" />;
  switch (status) {
    case 'verified': return <ShieldCheck size={14} className="mr-1" />;
    case 'recentlyAdded': return <Hourglass size={14} className="mr-1" />;
    case 'archived': return <Archive size={14} className="mr-1" />;
    default: return <Info size={14} className="mr-1" />;
  }
};

const STATUS_LABELS: Record<CultivarStatus, string> = {
  recentlyAdded: 'Recently Added',
  verified: 'Verified',
  archived: 'Archived',
};

export default function CultivarListItem({ cultivar, onStatusChange }: CultivarListItemProps) {
  const { toast } = useToast();
  const [isArchiving, setIsArchiving] = useState(false);
  const isArchived = cultivar.status === 'archived';

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering link navigation if any
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

  const thcMin = cultivar.thc?.min ?? 'N/A';
  const thcMax = cultivar.thc?.max ?? 'N/A';
  const cbdMin = cultivar.cbd?.min ?? 'N/A';
  const cbdMax = cultivar.cbd?.max ?? 'N/A';

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow duration-200 bg-card",
        isArchived && "opacity-60 bg-muted/30"
      )}
    >
      <div className="flex-shrink-0">
        {cultivar.images && cultivar.images.length > 0 ? (
          <Image
            src={cultivar.images[0].url}
            alt={cultivar.images[0].alt}
            data-ai-hint={cultivar.images[0]['data-ai-hint'] as string}
            width={64}
            height={64}
            className="rounded-md object-cover h-16 w-16"
          />
        ) : (
          <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
            <ImageOff size={32} />
          </div>
        )}
      </div>

      <div className="flex-grow space-y-1 w-full sm:w-auto">
        <Link href={`/cultivars/${cultivar.id}`} className="font-semibold text-lg text-primary hover:underline" aria-label={`View details for ${cultivar.name}`}>
            {cultivar.name}
        </Link>
        <div className="flex items-center flex-wrap gap-2 text-sm">
          <Badge variant="secondary" className="text-xs">{cultivar.genetics}</Badge>
          {cultivar.status && (
            <Badge variant={getStatusBadgeVariant(cultivar.status)} className="capitalize text-xs flex items-center">
              {getStatusIcon(cultivar.status)}
              {STATUS_LABELS[cultivar.status]}
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="flex items-center"><ThermometerSun size={12} className="mr-1 text-red-500" /> THC: {thcMin !== 'N/A' ? `${thcMin}%` : 'N/A'} - {thcMax !== 'N/A' ? `${thcMax}%` : 'N/A'}</span>
          <span className="flex items-center"><ThermometerSnowflake size={12} className="mr-1 text-blue-500" /> CBD: {cbdMin !== 'N/A' ? `${cbdMin}%` : 'N/A'} - {cbdMax !== 'N/A' ? `${cbdMax}%` : 'N/A'}</span>
        </div>
      </div>

      <div className="flex flex-row sm:flex-col md:flex-row items-center gap-2 flex-shrink-0 mt-3 sm:mt-0 w-full sm:w-auto justify-start sm:justify-end">
        <Link href={`/cultivars/edit/${cultivar.id}`}>
          <Button variant="outline" size="sm" className="w-full min-w-[80px]" disabled={isArchived} aria-label={`Edit ${cultivar.name}`}>
            <Edit size={14} className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Edit</span>
            <span className="sm:hidden">Edit</span>
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          className="w-full min-w-[80px] text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
          onClick={handleArchive}
          disabled={isArchived || isArchiving}
          aria-label={`Archive ${cultivar.name}`}
        >
          <Archive size={14} className="mr-1 sm:mr-2" />
          <span className="hidden sm:inline">{isArchiving ? 'Archiving...' : 'Archive'}</span>
          <span className="sm:hidden">{isArchiving ? '...' : 'Archive'}</span>
        </Button>
      </div>
    </div>
  );
}
