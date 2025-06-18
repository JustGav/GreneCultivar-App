
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit3, Percent, Clock, Sprout, Paperclip, PlusCircle, Palette, DollarSign, Sunrise, Smile, Stethoscope } from "lucide-react";

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
          {[1, 2, 3].map(i => ( // Basic info fields
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-1/4" /> {/* Label */}
              <Skeleton className="h-10 w-full" /> {/* Input */}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Reported Effects Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Smile size={24} className="mr-2 text-muted-foreground/50" />
            <Skeleton className="h-8 w-1/2" /> {/* Section Title: Reported Effects */}
          </div>
          <Skeleton className="h-5 w-full mt-1" /> {/* Description */}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 border rounded-md space-y-2">
            <Skeleton className="h-4 w-1/3 mb-1" /> {/* Label Effect */}
            <Skeleton className="h-10 w-full" /> {/* Effect Select/Input */}
          </div>
          <Skeleton className="h-9 w-32" /> {/* Add Effect Button */}
        </CardContent>
      </Card>

      {/* Potential Medical Effects Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Stethoscope size={24} className="mr-2 text-muted-foreground/50" />
            <Skeleton className="h-8 w-1/2" /> {/* Section Title: Medical Effects */}
          </div>
          <Skeleton className="h-5 w-full mt-1" /> {/* Description */}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 border rounded-md space-y-2">
            <Skeleton className="h-4 w-1/3 mb-1" /> {/* Label Medical Effect */}
            <Skeleton className="h-10 w-full" /> {/* Medical Effect Select/Input */}
          </div>
          <Skeleton className="h-9 w-40" /> {/* Add Medical Effect Button */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Percent size={24} className="mr-2 text-muted-foreground/50" />
            <Skeleton className="h-8 w-1/2" /> {/* Section Title: Cannabinoids */}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3].map(i => ( // Cannabinoid min/max pairs
            <div key={i} className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Primary Image Skeleton */}
       <Card>
        <CardHeader>
            <div className="flex items-center">
                <Skeleton className="h-6 w-6 mr-2 text-muted-foreground/50 rounded-full" /> {/* Icon Placeholder */}
                <Skeleton className="h-8 w-1/2" /> {/* Section Title: Primary Image */}
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <Skeleton className="h-4 w-1/4 mb-1" /> {/* Label */}
                <Skeleton className="h-10 w-full" /> {/* Input */}
            </div>
             <div>
                <Skeleton className="h-4 w-1/4 mb-1" /> {/* Label */}
                <Skeleton className="h-10 w-full" /> {/* Input */}
            </div>
             <div>
                <Skeleton className="h-4 w-1/3 mb-1" /> {/* Label */}
                <Skeleton className="h-10 w-full" /> {/* Input */}
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Palette size={24} className="mr-2 text-muted-foreground/50" />
            <Skeleton className="h-8 w-1/2" /> {/* Section Title: Terpene Profile */}
          </div>
          <Skeleton className="h-5 w-full mt-1" /> {/* Description */}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Placeholder for one terpene entry */}
          <div className="p-3 border rounded-md space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Skeleton className="h-4 w-1/3 mb-1" /> {/* Label Name */}
                    <Skeleton className="h-10 w-full" /> {/* Name Select/Input */}
                </div>
                 <div>
                    <Skeleton className="h-4 w-1/4 mb-1" /> {/* Label Percentage */}
                    <Skeleton className="h-10 w-full" /> {/* Percentage Input */}
                </div>
            </div>
          </div>
          <Skeleton className="h-9 w-32" /> {/* Add Terpene Button */}
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
            {[1,2,3,4,5].map(i => ( // For Germination, Rooting, Vegetative, Flowering, Harvest
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
                <Skeleton className="h-20 w-full" /> {/* Min/Max Height */}
                <Skeleton className="h-20 w-full" /> 
            </div>
             <Skeleton className="h-px w-full" /> {/* Separator */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-20 w-full" /> {/* Min/Max Moisture */}
                <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-px w-full" /> {/* Separator */}
            <Skeleton className="h-28 w-full" /> {/* Yields */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center">
            <DollarSign size={24} className="mr-2 text-muted-foreground/50" />
            <Skeleton className="h-8 w-1/2" /> {/* Section Title: Pricing */}
          </div>
          <Skeleton className="h-5 w-full mt-1" /> {/* Description */}
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-1/3" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-1/3" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-1/3" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Paperclip size={28} className="mr-3 text-muted-foreground/50" />
            <Skeleton className="h-8 w-1/2" /> {/* Section Title: Additional Info */}
          </div>
          <Skeleton className="h-5 w-full mt-1" /> {/* Description */}
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3, 4].map(i => ( // Loop for 4 categories
            <div key={i} className="space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-1/3" /> {/* File Category Title */}
                <Skeleton className="h-8 w-28" /> {/* Add File Button */}
              </div>
              {/* Placeholder for one file entry per category */}
              <div className="p-3 border rounded-md space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Skeleton className="h-4 w-1/4 mb-1" /> {/* Label */}
                        <Skeleton className="h-10 w-full" /> {/* Name Input */}
                    </div>
                    <div>
                        <Skeleton className="h-4 w-1/4 mb-1" /> {/* Label */}
                        <Skeleton className="h-10 w-full" /> {/* URL Input */}
                    </div>
                </div>
                {i === 1 && ( /* Example: AI Hint for second category (Plant Pictures) */
                    <div>
                        <Skeleton className="h-4 w-1/3 mb-1" /> {/* Label */}
                        <Skeleton className="h-10 w-full" /> {/* AI Hint Input */}
                    </div>
                )}
              </div>
              {i < 4 && <Skeleton className="h-px w-full my-3" />} {/* Separator */}
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
