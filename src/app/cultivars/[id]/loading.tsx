
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Leaf, MessageSquare, Percent, Smile, Timer, UserCircle, Sprout, Flower, ScissorsIcon as Scissors, Combine, Droplets, BarChartBig, Paperclip, Award, Image as ImageIconSkeleton, FileText as FileTextSkeleton, FlaskConical as FlaskConicalSkeleton, Palette, DollarSign, Sunrise, Stethoscope, ExternalLink, Network, Database, CheckCheck, ShieldCheck, ArchiveIcon, Info, CalendarDays, Utensils } from "lucide-react";

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
              <div className="flex justify-between items-start">
                <div className="flex items-center w-3/4">
                  <Leaf size={36} className="mr-3 text-muted-foreground/50" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-8 w-28 rounded-md" /> {/* Status Badge Skeleton */}
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-3/4 mb-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-6">
                <div className="flex items-center">
                    <ExternalLink size={16} className="mr-2 text-muted-foreground/50"/>
                    <Skeleton className="h-5 w-1/3" />
                </div>
                 <div className="flex items-center">
                    <Database size={16} className="mr-2 text-muted-foreground/50"/>
                    <Skeleton className="h-5 w-1/2" /> {/* Source Skeleton */}
                </div>
                <div className="flex items-center">
                    <CalendarDays size={16} className="mr-2 text-muted-foreground/50"/>
                    <Skeleton className="h-5 w-2/5" /> {/* Created At Skeleton */}
                </div>
                <div className="flex items-center">
                    <CalendarDays size={16} className="mr-2 text-muted-foreground/50"/>
                    <Skeleton className="h-5 w-2/5" /> {/* Updated At Skeleton */}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center"><Percent size={20} className="mr-2 text-muted-foreground/50"/>Cannabinoid Profile</h3>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              </div>

              <div className="mb-6 pt-6 border-t">
                <div className="flex items-center mb-3">
                  <Palette size={20} className="mr-2 text-muted-foreground/50" />
                  <Skeleton className="h-6 w-1/3" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-1 p-2 bg-muted/40 rounded-md">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6 pt-6 border-t">
                <h3 className="font-semibold text-lg flex items-center mb-3">
                    <Combine size={20} className="mr-2 text-muted-foreground/50"/>
                    <Skeleton className="h-6 w-1/2" />
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-4">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-3/4" />
                </div>
                <div className="mt-4 pt-4 border-t border-dashed pb-4">
                    <h4 className="font-medium text-md flex items-center mb-2">
                        <Droplets size={18} className="mr-2 text-muted-foreground/50"/>
                        <Skeleton className="h-5 w-2/5" />
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-5 w-3/4" />
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-dashed">
                    <h4 className="font-medium text-md flex items-center mb-2">
                        <BarChartBig size={18} className="mr-2 text-muted-foreground/50"/>
                        <Skeleton className="h-5 w-2/5" />
                    </h4>
                    <div className="space-y-1">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-5 w-3/4" />
                    </div>
                </div>
              </div>


              <div className="pt-6 border-t">
                <h3 className="font-semibold text-lg flex items-center mb-4">
                  <Timer size={20} className="mr-2 text-muted-foreground/50"/>
                  <Skeleton className="h-6 w-1/2" />
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Sunrise size={18} className="text-muted-foreground/50" /> <Skeleton className="h-5 w-3/4" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sprout size={18} className="text-muted-foreground/50" /> <Skeleton className="h-5 w-3/4" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Leaf size={18} className="text-muted-foreground/50" /> <Skeleton className="h-5 w-3/4" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Flower size={18} className="text-muted-foreground/50" /> <Skeleton className="h-5 w-3/4" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Scissors size={18} className="text-muted-foreground/50" /> <Skeleton className="h-5 w-3/4" />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <div className="flex items-center mb-3">
                    <DollarSign size={20} className="mr-2 text-muted-foreground/50" />
                    <Skeleton className="h-6 w-2/5" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-3/4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Smile size={28} className="mr-3 text-muted-foreground/50" />
                <Skeleton className="h-8 w-2/5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>

           <Card>
            <CardHeader>
              <div className="flex items-center">
                <Utensils size={28} className="mr-3 text-muted-foreground/50" />
                <Skeleton className="h-8 w-2/5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Stethoscope size={28} className="mr-3 text-muted-foreground/50" />
                <Skeleton className="h-8 w-3/5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg"> {/* Lineage Graph Skeleton */}
            <CardHeader>
              <div className="flex items-center">
                <Network size={28} className="mr-3 text-muted-foreground/50" />
                <Skeleton className="h-8 w-1/3" /> {/* Lineage Graph title */}
              </div>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              {/* Parent Skeleton */}
              <div>
                <Skeleton className="h-4 w-1/4 mx-auto mb-2" /> {/* "Parents" label */}
                <div className="flex justify-center space-x-3">
                  <Skeleton className="h-10 w-20 rounded-md p-2" />
                </div>
                <Skeleton className="h-4 w-px bg-muted mx-auto my-2" /> {/* Connector */}
              </div>

              {/* Current Cultivar Skeleton */}
              <Skeleton className="h-12 w-28 rounded-lg mx-auto p-3" />

              {/* Children Skeleton */}
              <div>
                <Skeleton className="h-4 w-px bg-muted mx-auto my-2" /> {/* Connector */}
                <Skeleton className="h-4 w-1/4 mx-auto mb-2" /> {/* "Children" label */}
                <div className="flex justify-center space-x-3">
                  <Skeleton className="h-10 w-20 rounded-md p-2" />
                  <Skeleton className="h-10 w-20 rounded-md p-2" />
                </div>
              </div>
            </CardContent>
          </Card>


          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center">
                <Paperclip size={28} className="mr-3 text-muted-foreground/50" />
                <Skeleton className="h-8 w-3/5" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { icon: Award, titleWidth: "w-2/5" },
                { icon: ImageIconSkeleton, titleWidth: "w-1/2" }
              ].map((category, i) => {
                const IconComponent = category.icon;
                return (
                  <div key={i} className="pt-4 border-t first:border-t-0 first:pt-0">
                    <div className="flex items-center mb-3">
                      <IconComponent size={20} className="mr-2 text-muted-foreground/50" />
                      <Skeleton className={`h-6 ${category.titleWidth}`} />
                    </div>
                    <ul className="space-y-2 pl-1">
                      {[1,2].map(j => (
                        <li key={j} className="text-sm">
                          <div className="flex items-center space-x-3 p-2 rounded-md">
                            <Skeleton className="w-20 h-14 rounded-md" />
                            <Skeleton className="h-5 w-3/4" />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </CardContent>
          </Card>

        </div>

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

