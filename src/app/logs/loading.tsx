
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, ListRestart, Search, Filter, CalendarIcon, ChevronDown } from "lucide-react";

export default function LogsPageLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="flex items-center mb-4 sm:mb-0">
          <FileText className="mr-3 h-8 w-8 text-muted-foreground/50" />
          <Skeleton className="h-10 w-48" /> {/* Title */}
        </div>
        <Skeleton className="h-9 w-36" /> {/* Reset Filters Button */}
      </div>

      <Card>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-4 w-1/3" /> {/* Label */}
              <Skeleton className="h-10 w-full" /> {/* Input/Button */}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center justify-end mb-4">
        <Skeleton className="h-9 w-48" /> {/* Sort Button */}
      </div>

      <div className="overflow-x-auto">
        <Skeleton className="h-12 w-full mb-2" /> {/* Table Header */}
        {[...Array(10)].map((_, i) => (
          <div key={i} className="grid grid-cols-5 gap-4 p-4 border-b">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center space-x-2 py-4">
        <Skeleton className="h-9 w-24" /> {/* Prev Button */}
        <Skeleton className="h-5 w-20" /> {/* Page Info */}
        <Skeleton className="h-9 w-20" /> {/* Next Button */}
      </div>
    </div>
  );
}
