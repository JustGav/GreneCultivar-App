import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Leaf, MessageSquare, Percent, Smile, ThermometerSnowflake, ThermometerSun, UserCircle } from "lucide-react";

export default function CultivarDetailLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <Skeleton className="h-8 w-48" /> {/* Back link */}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery Skeleton */}
          <Card>
            <CardContent className="p-0">
              <Skeleton className="aspect-video w-full" />
              <div className="p-2 bg-muted/50">
                <div className="flex space-x-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="w-20 h-16 rounded-md" />)}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Cultivar Info Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Leaf size={36} className="mr-3 text-muted-foreground/50" />
                <Skeleton className="h-10 w-3/4" />
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-3/4 mb-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center"><Percent size={20} className="mr-2 text-muted-foreground/50"/>Potency</h3>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-3/4" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center"><Smile size={20} className="mr-2 text-muted-foreground/50"/>Effects</h3>
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-12 rounded-full" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Review Form Skeleton */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full mt-1" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Skeleton className="h-5 w-1/3 mb-2" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div>
                <Skeleton className="h-5 w-1/2 mb-2" />
                <Skeleton className="h-8 w-32" />
              </div>
            </CardContent>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </section>

      <Skeleton className="h-px w-full my-8" />

      {/* Reviews Section Skeleton */}
      <section>
        <div className="flex items-center mb-6">
          <MessageSquare size={30} className="mr-3 text-muted-foreground/50"/>
          <Skeleton className="h-8 w-1/3" />
        </div>
        <div className="space-y-6">
          {[1, 2].map(i => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <UserCircle size={22} className="mr-2 text-muted-foreground/50"/>
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <Skeleton className="h-5 w-28 mt-1" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
