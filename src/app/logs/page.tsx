
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { Cultivar, CultivarHistoryEntry, DisplayLogEntry } from '@/types';
import { getCultivars } from '@/services/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO, isValid as isValidDate, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Loader2, FileText, Search, Filter, CalendarIcon, AlertTriangle, ChevronDown, ChevronLeft, ChevronRight, ListRestart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import LogsPageLoading from './loading'; 

const ITEMS_PER_PAGE = 20;

const EVENT_TYPE_OPTIONS = [
  "Cultivar Created",
  "Cultivar Submitted by User",
  "Cultivar Details Updated",
  "Status changed", 
  "Review Added",
  "Cultivar Seeded",
];


export default function LogsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [allLogs, setAllLogs] = useState<DisplayLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cultivarNameFilter, setCultivarNameFilter] = useState('');
  const [userFilter, setUserFilter] = useState(''); 
  const [eventTypeFilters, setEventTypeFilters] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortAscending, setSortAscending] = useState(false); 


  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const cultivars = await getCultivars();
      const logs: DisplayLogEntry[] = [];
      cultivars.forEach(cultivar => {
        (cultivar.history || []).forEach(entry => {
          let userDisplay = 'System/Unknown';
          if (entry.details?.seededBy === 'system') {
            userDisplay = 'System (Seed)';
          } else if (entry.userId) {
            userDisplay = entry.details?.userEmail || entry.details?.userName || entry.userId;
          } else if (entry.details?.userSource) {
            userDisplay = entry.details.userSource;
          }
          
          logs.push({
            ...entry,
            cultivarId: cultivar.id,
            cultivarName: cultivar.name,
            userDisplay,
          });
        });
      });
      
      logs.sort((a, b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime());
      setAllLogs(logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({
        title: 'Error Fetching Logs',
        description: 'Could not load audit logs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user, fetchLogs]);

  const filteredLogs = useMemo(() => {
    return allLogs
      .filter(log => {
        // Primary filter: ensure log.event is present and a non-empty string
        if (!log.event || typeof log.event !== 'string' || log.event.trim() === '') {
          return false;
        }

        const logDate = parseISO(log.timestamp);
        if (!isValidDate(logDate)) return false;

        const nameMatch = cultivarNameFilter ? log.cultivarName.toLowerCase().includes(cultivarNameFilter.toLowerCase()) : true;
        const userMatch = userFilter ? log.userDisplay.toLowerCase().includes(userFilter.toLowerCase()) || (log.userId && log.userId.toLowerCase().includes(userFilter.toLowerCase())) : true;
        
        const eventTypeMatch = eventTypeFilters.length > 0 
          ? eventTypeFilters.some(filterEvent => log.event && log.event.includes(filterEvent)) 
          : true;
        
        let dateMatch = true;
        if (dateRange?.from && dateRange?.to) {
          dateMatch = isWithinInterval(logDate, { start: startOfDay(dateRange.from), end: endOfDay(dateRange.to) });
        } else if (dateRange?.from) {
          dateMatch = logDate >= startOfDay(dateRange.from);
        }
        
        return nameMatch && userMatch && eventTypeMatch && dateMatch;
      })
      .sort((a, b) => {
        const timeA = parseISO(a.timestamp).getTime();
        const timeB = parseISO(b.timestamp).getTime();
        return sortAscending ? timeA - timeB : timeB - timeA;
      });
  }, [allLogs, cultivarNameFilter, userFilter, eventTypeFilters, dateRange, sortAscending]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);

  const handleResetFilters = () => {
    setCultivarNameFilter('');
    setUserFilter('');
    setEventTypeFilters([]);
    setDateRange(undefined);
    setCurrentPage(1);
    setSortAscending(false);
  };

  const handleEventTypeToggle = (eventType: string) => {
    setEventTypeFilters(prev =>
      prev.includes(eventType)
        ? prev.filter(e => e !== eventType)
        : [...prev, eventType]
    );
    setCurrentPage(1);
  };
  
  useEffect(() => {
    setCurrentPage(1); 
  }, [cultivarNameFilter, userFilter, eventTypeFilters, dateRange, sortAscending]);


  if (authLoading) {
    return <LogsPageLoading />;
  }

  if (!user) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <AlertTriangle size={64} className="text-destructive mb-4" />
        <h1 className="text-3xl font-headline text-destructive mb-2">Access Denied</h1>
        <p className="text-muted-foreground font-body mb-6">
          You must be logged in to view audit logs.
        </p>
        <Link href="/">
          <Button variant="default">Go to Homepage</Button>
        </Link>
      </div>
    );
  }
  
  if (isLoading && allLogs.length === 0) {
    return <LogsPageLoading />;
  }


  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-3xl font-headline text-primary flex items-center mb-4 sm:mb-0">
          <FileText className="mr-3 h-8 w-8" />
          Cultivar Audit Logs
        </h1>
        <Button onClick={handleResetFilters} variant="outline">
          <ListRestart className="mr-2 h-4 w-4" /> Reset Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-card shadow">
        <div>
          <Label htmlFor="cultivarNameFilter" className="text-sm font-medium">Cultivar Name</Label>
          <Input
            id="cultivarNameFilter"
            placeholder="Search by cultivar name..."
            value={cultivarNameFilter}
            onChange={(e) => setCultivarNameFilter(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="userFilter" className="text-sm font-medium">User/Source</Label>
          <Input
            id="userFilter"
            placeholder="Search by user/source..."
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm font-medium block mb-1">Event Type</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {eventTypeFilters.length > 0 ? `${eventTypeFilters.length} selected` : "Filter by Event Type"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Event Types</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {EVENT_TYPE_OPTIONS.map((eventType) => (
                <DropdownMenuCheckboxItem
                  key={eventType}
                  checked={eventTypeFilters.includes(eventType)}
                  onCheckedChange={() => handleEventTypeToggle(eventType)}
                  onSelect={(e) => e.preventDefault()} 
                >
                  {eventType}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <Label className="text-sm font-medium block mb-1">Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
        </div>
      </div>
      
      <div className="flex items-center justify-end mb-4">
        <Button variant="outline" size="sm" onClick={() => setSortAscending(prev => !prev)}>
          Sort by Timestamp: {sortAscending ? 'Oldest First' : 'Newest First'}
        </Button>
      </div>


      {paginatedLogs.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Timestamp</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Cultivar</TableHead>
                <TableHead>User/Source</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.map((log, index) => (
                <TableRow key={`${log.cultivarId}-${log.timestamp}-${index}`}>
                  <TableCell>{format(parseISO(log.timestamp), "MMM dd, yyyy, HH:mm:ss")}</TableCell>
                  <TableCell>{log.event}</TableCell>
                  <TableCell>
                     <Link href={`/cultivars/${log.cultivarId}`} className="text-primary hover:underline" target="_blank">
                        {log.cultivarName}
                    </Link>
                  </TableCell>
                  <TableCell>{log.userDisplay}</TableCell>
                  <TableCell className="text-xs max-w-xs truncate">
                    {
                      (log.event === 'Cultivar Seeded' && log.userDisplay === 'System (Seed)')
                      ? 'System Action'
                      : (log.details && Object.keys(log.details).length > 0)
                        ? Object.entries(log.details)
                            .filter(([key]) => !(log.event === 'Cultivar Seeded' && key === 'seededBy')) 
                            .map(([key, value]) => {
                              if (key === 'changes' && typeof value === 'object' && value !== null) {
                                return `Changes: ${Object.keys(value).join(', ')}`;
                              }
                              if (key === 'updatedFields' && Array.isArray(value)) {
                                return `Updated: ${value.join(', ')}`;
                              }
                              return `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`;
                            })
                            .join('; ') || 'N/A'
                        : 'N/A'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
         <div className="text-center py-10">
            <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">No logs match your current filters.</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

