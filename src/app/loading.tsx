import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]"> {/* Adjust min-h based on header/footer height */}
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="mt-4 text-lg text-muted-foreground font-body">Loading GreneCultivar...</p>
    </div>
  );
}
