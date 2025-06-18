
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit3, Percent, Clock, Sprout, Paperclip, PlusCircle, Palette, DollarSign, Sunrise, Smile, Stethoscope, Users, Network, ImageIcon as ImageIconLucide, Database, CheckCheck, ShieldCheck, ArchiveIcon } from "lucide-react";

export default function EditCultivarLoading() {
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-10 w-full" /> {/* Name Input */}
            <Skeleton className="h-10 w-full" /> {/* Genetics Radio Group */}
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-10 w-full" /> {/* Status Select */}
            <Skeleton className="h-10 w-full" /> {/* Source Input */}
          </div>
          <Skeleton className="h-20 w-full" /> {/* Description Textarea */}
          <Skeleton className="h-10 w-full" /> {/* Supplier URL Input */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Palette size={24} className="mr-2 text-muted-foreground/50" />
            <Skeleton className="h-8 w-1/2" /> 
          </div>
          <Skeleton className="h-5 w-full mt-1" /> 
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 border rounded-md space-y-2">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Skeleton className="h-4 w-1/3 mb-1" /> 
                    <Skeleton className="h-10 w-full" /> 
                </div>
                 <div>
                    <Skeleton className="h-4 w-1/4 mb-1" /> 
                    <Skeleton className="h-10 w-full" /> 
                </div>
            </div>
          </div>
          <Skeleton className="h-9 w-32" /> 
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Smile size={24} className="mr-2 text-muted-foreground/50" />
            <Skeleton className="h-8 w-1/2" /> 
          </div>
          <Skeleton className="h-5 w-full mt-1" /> 
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 border rounded-md space-y-2">
            <Skeleton className="h-4 w-1/3 mb-1" /> 
            <Skeleton className="h-10 w-full" /> 
          </div>
          <Skeleton className="h-9 w-32" /> 
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Stethoscope size={24} className="mr-2 text-muted-foreground/50" />
            <Skeleton className="h-8 w-1/2" /> 
          </div>
          <Skeleton className="h-5 w-full mt-1" /> 
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 border rounded-md space-y-2">
            <Skeleton className="h-4 w-1/3 mb-1" /> 
            <Skeleton className="h-10 w-full" /> 
          </div>
          <Skeleton className="h-9 w-40" /> 
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
            <div className="flex items-center">
                <ImageIconLucide size={24} className="mr-2 text-muted-foreground/50" />
                <Skeleton className="h-8 w-1/2" /> 
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <Skeleton className="h-32 w-48 rounded-md mb-2" /> {/* Existing Image Preview */}
            <div>
                <Skeleton className="h-4 w-1/4 mb-1" /> 
                <Skeleton className="h-10 w-full" /> 
            </div>
             <div>
                <Skeleton className="h-4 w-1/4 mb-1" /> 
                <Skeleton className="h-10 w-full" /> 
            </div>
             <div>
                <Skeleton className="h-4 w-1/3 mb-1" /> 
                <Skeleton className="h-10 w-full" /> 
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Percent size={24} className="mr-2 text-muted-foreground/50" />
            <Skeleton className="h-8 w-1/2" /> 
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
                <Skeleton className="h-8 w-1/2" /> 
            </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1,2,3,4,5].map(i => ( 
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
                <Skeleton className="h-8 w-1/2" /> 
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-1/3" /> 
                  <Skeleton className="h-10 w-full" /> 
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-1/3" /> 
                  <Skeleton className="h-10 w-full" /> 
                </div>
            </div>
             <Skeleton className="h-px w-full" /> 
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <Skeleton className="h-5 w-1/3" /> 
                  <Skeleton className="h-10 w-full" /> 
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-1/3" /> 
                  <Skeleton className="h-10 w-full" /> 
                </div>
            </div>
            <Skeleton className="h-px w-full" /> 
            <Skeleton className="h-28 w-full" /> 
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center">
            <DollarSign size={24} className="mr-2 text-muted-foreground/50" />
            <Skeleton className="h-8 w-1/2" /> 
          </div>
          <Skeleton className="h-5 w-full mt-1" /> 
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-1/3" /> 
            <Skeleton className="h-10 w-full" /> 
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-1/3" /> 
            <Skeleton className="h-10 w-full" /> 
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-1/3" /> 
            <Skeleton className="h-10 w-full" /> 
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Users size={24} className="mr-2 text-muted-foreground/50" />
            <Skeleton className="h-8 w-1/2" /> 
          </div>
          <Skeleton className="h-5 w-full mt-1" /> 
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 border rounded-md space-y-2">
            <Skeleton className="h-4 w-1/3 mb-1" /> 
            <Skeleton className="h-10 w-full" /> 
          </div>
          <Skeleton className="h-9 w-32" /> 
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Users size={24} className="mr-2 text-muted-foreground/50" />
            <Skeleton className="h-8 w-1/2" /> 
          </div>
          <Skeleton className="h-5 w-full mt-1" /> 
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 border rounded-md space-y-2">
            <Skeleton className="h-4 w-1/3 mb-1" /> 
            <Skeleton className="h-10 w-full" /> 
          </div>
          <Skeleton className="h-9 w-32" /> 
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Paperclip size={28} className="mr-3 text-muted-foreground/50" />
            <Skeleton className="h-8 w-1/2" /> 
          </div>
          <Skeleton className="h-5 w-full mt-1" /> 
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3, 4].map(i => ( 
            <div key={i} className="space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-1/3" /> 
                <Skeleton className="h-8 w-28" /> 
              </div>
              <div className="p-3 border rounded-md space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Skeleton className="h-4 w-1/4 mb-1" /> 
                        <Skeleton className="h-10 w-full" /> 
                    </div>
                    <div>
                        <Skeleton className="h-4 w-1/4 mb-1" /> 
                        <Skeleton className="h-10 w-full" /> 
                    </div>
                </div>
                {i === 1 && ( 
                    <div>
                        <Skeleton className="h-4 w-1/3 mb-1" /> 
                        <Skeleton className="h-10 w-full" /> 
                    </div>
                )}
              </div>
              {i < 4 && <Skeleton className="h-px w-full my-3" />} 
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="pt-6 border-t">
        <Skeleton className="h-12 w-full md:w-48" /> 
      </div>
    </div>
  );
}
