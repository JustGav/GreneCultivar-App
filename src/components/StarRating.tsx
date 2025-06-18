'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  readOnly?: boolean;
  size?: number;
  className?: string;
}

export default function StarRating({
  rating,
  onRate,
  readOnly = false,
  size = 24,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(rating);

  useEffect(() => {
    setCurrentRating(rating);
  }, [rating]);

  const handleMouseOver = (index: number) => {
    if (!readOnly) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  const handleClick = (index: number) => {
    if (!readOnly && onRate) {
      setCurrentRating(index);
      onRate(index);
    }
  };

  return (
    <div className={cn("flex items-center space-x-1", className)} aria-label={`Rating: ${currentRating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((index) => {
        const fillClass = 
          (hoverRating || currentRating) >= index
            ? 'text-accent fill-accent'
            : 'text-muted-foreground/50';
        
        return (
          <button
            key={index}
            type="button"
            className={cn(
              "transition-colors duration-150 ease-in-out",
              !readOnly && "cursor-pointer hover:scale-110 transform"
            )}
            onClick={() => handleClick(index)}
            onMouseOver={() => handleMouseOver(index)}
            onMouseLeave={handleMouseLeave}
            disabled={readOnly}
            aria-label={readOnly ? undefined : `Rate ${index} star${index > 1 ? 's' : ''}`}
          >
            <Star
              size={size}
              className={cn(fillClass, "transition-colors")}
            />
          </button>
        );
      })}
    </div>
  );
}
