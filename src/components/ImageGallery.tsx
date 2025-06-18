'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { CultivarImage as ImageType } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { Button } from './ui/button';

interface ImageGalleryProps {
  images: ImageType[];
  cultivarName: string;
}

export default function ImageGallery({ images, cultivarName }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);

  useEffect(() => {
    if (images && images.length > 0) {
      setSelectedImage(images[0]);
    } else {
      setSelectedImage(null);
    }
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <Card className="overflow-hidden shadow-lg animate-fadeIn">
        <CardContent className="p-0">
          <div className="aspect-video bg-muted flex flex-col items-center justify-center text-muted-foreground p-6">
            <ImageOff size={48} className="mb-2" />
            <p className="text-lg font-semibold">No Images Available</p>
            <p className="text-sm">There are no images uploaded for {cultivarName} yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const currentIndex = selectedImage ? images.findIndex(img => img.id === selectedImage.id) : -1;

  const navigateImage = (direction: 'prev' | 'next') => {
    if (currentIndex === -1) return;
    let nextIndex;
    if (direction === 'prev') {
      nextIndex = (currentIndex - 1 + images.length) % images.length;
    } else {
      nextIndex = (currentIndex + 1) % images.length;
    }
    setSelectedImage(images[nextIndex]);
  };


  return (
    <Card className="overflow-hidden shadow-lg animate-fadeIn">
      <CardContent className="p-0">
        {selectedImage && (
          <div className="relative aspect-video group">
            <Image
              src={selectedImage.url}
              alt={selectedImage.alt || `Image of ${cultivarName}`}
              data-ai-hint={selectedImage['data-ai-hint'] as string}
              fill
              style={{ objectFit: 'cover' }}
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="transition-transform duration-300 ease-in-out"
            />
            {images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 opacity-50 group-hover:opacity-100 transition-opacity rounded-full bg-background/70 hover:bg-background"
                  onClick={() => navigateImage('prev')}
                  aria-label="Previous image"
                >
                  <ChevronLeft />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-50 group-hover:opacity-100 transition-opacity rounded-full bg-background/70 hover:bg-background"
                  onClick={() => navigateImage('next')}
                  aria-label="Next image"
                >
                  <ChevronRight />
                </Button>
              </>
            )}
          </div>
        )}
        {images.length > 1 && (
          <div className="p-2 bg-muted/50">
            <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(image)}
                  className={cn(
                    "block w-20 h-16 rounded-md overflow-hidden border-2 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-150",
                    selectedImage?.id === image.id ? 'border-primary scale-105 shadow-md' : 'border-transparent hover:border-primary/50'
                  )}
                  aria-label={`View image ${index + 1} of ${cultivarName}`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt || `Thumbnail of ${cultivarName} ${index + 1}`}
                    data-ai-hint={image['data-ai-hint'] as string}
                    width={80}
                    height={64}
                    style={{ objectFit: 'cover' }}
                    className="w-full h-full"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
