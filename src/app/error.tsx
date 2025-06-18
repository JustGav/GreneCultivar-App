'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
      <AlertTriangle size={64} className="text-destructive mb-4" />
      <h2 className="text-3xl font-headline text-destructive mb-2">Oops! Something went wrong.</h2>
      <p className="text-muted-foreground font-body mb-6 max-w-md">
        We encountered an unexpected issue. Please try again, or if the problem persists, contact support.
      </p>
      {error?.message && <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md mb-4">Error details: {error.message}</p>}
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        variant="destructive"
      >
        Try again
      </Button>
    </div>
  );
}
