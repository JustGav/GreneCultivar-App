
'use client';

import { useFilterContext } from '@/contexts/FilterContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Filter as FilterIcon, ListRestart, Utensils, ChevronsUpDown } from 'lucide-react';
import { Separator } from '../ui/separator';

interface FilterModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function FilterModal({ isOpen, onOpenChange }: FilterModalProps) {
  const {
    selectedEffects,
    selectedFlavors,
    allAvailableEffects,
    allAvailableFlavors,
    toggleEffect,
    toggleFlavor,
    resetFilters,
    isFiltersActive,
  } = useFilterContext();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center text-2xl">
            <FilterIcon className="mr-2 h-6 w-6 text-primary" /> Filter Cultivars
          </DialogTitle>
          <DialogDescription>
            Select effects and flavors to refine your search.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-grow px-6 overflow-y-auto">
          <div className="space-y-6 py-2">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <ChevronsUpDown className="mr-2 h-5 w-5 text-primary/80" />
                Filter by Effects:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                {allAvailableEffects.map(effect => (
                  <div key={effect} className="flex items-center space-x-2">
                    <Checkbox
                      id={`modal-effect-${effect}`}
                      checked={selectedEffects.includes(effect)}
                      onCheckedChange={() => toggleEffect(effect)}
                      aria-label={`Filter by ${effect}`}
                    />
                    <Label htmlFor={`modal-effect-${effect}`} className="font-normal text-sm cursor-pointer">
                      {effect}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Utensils className="mr-2 h-5 w-5 text-primary/80" />
                Filter by Flavors:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                {allAvailableFlavors.map(flavor => (
                  <div key={flavor} className="flex items-center space-x-2">
                    <Checkbox
                      id={`modal-flavor-${flavor}`}
                      checked={selectedFlavors.includes(flavor)}
                      onCheckedChange={() => toggleFlavor(flavor)}
                      aria-label={`Filter by ${flavor}`}
                    />
                    <Label htmlFor={`modal-flavor-${flavor}`} className="font-normal text-sm cursor-pointer">
                      {flavor}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 border-t flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => {
              resetFilters();
            }}
            disabled={!isFiltersActive}
            className="w-full sm:w-auto"
          >
            <ListRestart className="mr-2 h-4 w-4" /> Reset Filters
          </Button>
          <DialogClose asChild>
            <Button type="button" className="w-full sm:w-auto">Done</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
