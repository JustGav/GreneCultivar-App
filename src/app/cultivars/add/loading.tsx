
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit3, Percent, Clock, Sprout, Paperclip } from "lucide-react";

export default function AddCultivarLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <Skeleton className="h-8 w-48" /> {/* Back link */}

      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Edit3 size={30} className="mr-3 text-muted-foreground/50" />
            <Skeleton className="h-10 w-3/4" /> {/* Title */}
          </div>
          <Skeleton className="h-5 w-full mt-1" /> {/* Description */}
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-1/4" /> {/* Label */}
              <Skeleton className="h-10 w-full" /> {/* Input */}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Percent size={24} className="mr-2 text-muted-foreground/50" />
            <Skeleton className="h-8 w-1/2" /> {/* Section Title */}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <div className="flex items-center">
                <Clock size={24} className="mr-2 text-muted-foreground/50" />
                <Skeleton className="h-8 w-1/2" /> {/* Section Title: Cultivation */}
            </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1,2,3,4].map(i => (
                 <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <div className="flex items-center">
                <Sprout size={24} className="mr-2 text-muted-foreground/50" />
                <Skeleton className="h-8 w-1/2" /> {/* Section Title: Plant Chars */}
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
             <Skeleton className="h-px w-full" />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-28 w-full" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Paperclip size={28} className="mr-3 text-muted-foreground/50" />
            <Skeleton className="h-8 w-1/2" /> {/* Section Title: Additional Info */}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-6 w-1/3" /> {/* File Category Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" /> {/* Name Input */}
                <Skeleton className="h-10 w-full" /> {/* URL Input */}
              </div>
               {i === 1 && <Skeleton className="h-10 w-full" />} {/* AI Hint for second item example */}
              {i < 4 && <Skeleton className="h-px w-full my-2" />}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="pt-6 border-t">
        <Skeleton className="h-12 w-full md:w-36" /> {/* Submit Button */}
      </div>
    </div>
  );
}
