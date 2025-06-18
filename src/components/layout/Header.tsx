
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, LogIn, LogOut, UserCircle, Loader2, LayoutDashboard, PlusCircleIcon, Home, Search, Filter as FilterIcon, SortAsc, SortDesc, FileText as LogIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from 'react';
import LoginModal from '@/components/auth/LoginModal';
import SubmitCultivarModal from '@/components/auth/SubmitCultivarModal';
import FilterModal from '@/components/modals/FilterModal';
import { Input } from '@/components/ui/input';
import { useFilterContext, SORT_OPTIONS_CONFIG, type SortOption } from '@/contexts/FilterContext';
import { cn } from '@/lib/utils';

export default function Header() {
  const { user, loading, logout } = useAuth();
  const {
    searchTerm,
    setSearchTerm,
    isFiltersActive,
    sortOption,
    setSortOption,
  } = useFilterContext();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSubmitCultivarModalOpen, setIsSubmitCultivarModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (user && isLoginModalOpen) {
      setIsLoginModalOpen(false);
    }
  }, [user, isLoginModalOpen]);

  const handleHeaderSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleHeaderSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // console.log("Header search term:", searchTerm); // Intentionally commented out
  };

  const handleSortChange = (value: string) => {
    setSortOption(value as SortOption);
  }

  const isPublicBrowserPage = pathname === '/';

  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-2 py-1 flex items-center justify-between gap-2 sm:gap-3"> {/* Reduced py, px */}
        <div className="flex items-center gap-2 sm:gap-3 flex-grow min-w-0"> {/* Reduced gap */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity flex-shrink-0"> {/* Reduced gap */}
            <Leaf size={20} className="sm:size-22"/> {/* Reduced icon size */}
            <h1 className="text-lg sm:text-xl font-headline">GreneCultivar</h1> {/* Reduced text size */}
          </Link>

          <div className="relative hidden md:flex items-center gap-1.5 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"> {/* Reduced gap */}
            <form onSubmit={handleHeaderSearchSubmit} className="relative flex-grow">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary-foreground/60" /> {/* Adjusted icon positioning */}
              <Input
                type="search"
                placeholder="Search cultivars..."
                value={searchTerm}
                onChange={handleHeaderSearchChange}
                className="pl-8 pr-2 py-1 h-8 text-xs sm:text-sm w-full bg-primary/70 text-primary-foreground placeholder:text-primary-foreground/60 border-primary-foreground/40 focus:bg-primary/90 focus:border-primary-foreground/70 ring-offset-primary" /* Reduced h, py, pl, pr, text size */
                aria-label="Search cultivars"
              />
            </form>
            {isPublicBrowserPage && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsFilterModalOpen(true)}
                  className={cn(
                    "h-8 w-8 bg-primary/70 border-primary-foreground/40 text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground relative", /* Reduced h, w */
                    isFiltersActive && "ring-2 ring-offset-1 ring-offset-primary ring-accent"
                  )}
                  aria-label="Open filters"
                >
                  <FilterIcon className="h-3.5 w-3.5" /> {/* Reduced icon size */}
                  {isFiltersActive && (
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-accent border border-primary animate-pulse"></span> {/* Adjusted badge size/pos */}
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-primary/70 border-primary-foreground/40 text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" /* Reduced h, w */
                      aria-label="Sort options"
                    >
                      {sortOption.endsWith('-asc') ? <SortAsc className="h-3.5 w-3.5" /> : <SortDesc className="h-3.5 w-3.5" />} {/* Reduced icon size */}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-background text-foreground"> {/* Reduced w */}
                    <DropdownMenuLabel className="text-xs">Sort By</DropdownMenuLabel> {/* Reduced text size */}
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={sortOption} onValueChange={handleSortChange}>
                      {SORT_OPTIONS_CONFIG.map(opt => (
                        <DropdownMenuRadioItem key={opt.value} value={opt.value} className="cursor-pointer text-xs">{opt.label}</DropdownMenuRadioItem> /* Reduced text size */
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>

        <nav className="flex-shrink-0">
          {loading ? (
            <Button variant="outline" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:text-primary h-8 text-xs px-2 sm:px-3" disabled> {/* Reduced h, text size, px */}
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> {/* Reduced icon size */}
              Loading...
            </Button>
          ) : user ? (
            <div className="flex items-center gap-1.5"> {/* Reduced gap */}
              <Link href="/" passHref>
                <Button variant="outline" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:text-primary h-8 text-xs px-2 sm:px-3 hidden sm:flex"> {/* Reduced h, text size, px */}
                  <Home className="mr-1.5 h-3.5 w-3.5" /> {/* Reduced icon size */}
                  Public
                </Button>
              </Link>
              <Link href="/dashboard" passHref>
                <Button variant="outline" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:text-primary h-8 text-xs px-2 sm:px-3 hidden sm:flex"> {/* Reduced h, text size, px */}
                  <LayoutDashboard className="mr-1.5 h-3.5 w-3.5" /> {/* Reduced icon size */}
                  Dashboard
                </Button>
              </Link>
              <Link href="/logs" passHref>
                <Button variant="outline" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:text-primary h-8 text-xs px-2 sm:px-3 hidden sm:flex"> {/* Reduced h, text size, px */}
                  <LogIcon className="mr-1.5 h-3.5 w-3.5" /> {/* Reduced icon size */}
                  Logs
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-primary/80 p-0"> {/* Reduced h, w */}
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8"> {/* Reduced avatar size */}
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'} />
                      <AvatarFallback className="text-xs"> {/* Reduced text size */}
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserCircle size={16}/>} {/* Reduced icon size */}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-background text-foreground" align="end" forceMount> {/* Reduced w */}
                  <DropdownMenuLabel className="font-normal text-xs"> {/* Reduced text size */}
                    <div className="flex flex-col space-y-0.5"> {/* Reduced space-y */}
                      <p className="text-xs font-medium leading-none"> {/* Reduced text size */}
                        {user.displayName || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground"> {/* Reduced text size */}
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="sm:hidden cursor-pointer text-xs"> {/* Reduced text size */}
                    <Link href="/">
                       <Home className="mr-1.5 h-3.5 w-3.5" /> {/* Reduced icon size */}
                      Public Page
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="sm:hidden cursor-pointer text-xs"> {/* Reduced text size */}
                    <Link href="/dashboard">
                       <LayoutDashboard className="mr-1.5 h-3.5 w-3.5" /> {/* Reduced icon size */}
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild className="sm:hidden cursor-pointer text-xs"> {/* Reduced text size */}
                    <Link href="/logs">
                       <LogIcon className="mr-1.5 h-3.5 w-3.5" /> {/* Reduced icon size */}
                      Audit Logs
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="sm:hidden" />
                   <DropdownMenuItem onClick={() => setIsSubmitCultivarModalOpen(true)} className="cursor-pointer text-xs"> {/* Reduced text size */}
                    <PlusCircleIcon className="mr-1.5 h-3.5 w-3.5" /> {/* Reduced icon size */}
                    Submit Cultivar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive text-xs"> {/* Reduced text size */}
                    <LogOut className="mr-1.5 h-3.5 w-3.5" /> {/* Reduced icon size */}
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-1.5"> {/* Reduced gap */}
              <Button
                variant="outline"
                onClick={() => setIsSubmitCultivarModalOpen(true)}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:text-primary h-8 text-xs px-2 sm:px-3" /* Reduced h, text size, px */
              >
                <PlusCircleIcon className="mr-1.5 h-3.5 w-3.5" /> {/* Reduced icon size */}
                Submit
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:text-primary h-8 text-xs px-2 sm:px-3" /* Reduced h, text size, px */
              >
                <LogIn className="mr-1.5 h-3.5 w-3.5" /> {/* Reduced icon size */}
                Login
              </Button>
            </div>
          )}
        </nav>
      </div>

      <div className="container mx-auto px-2 pb-1 md:hidden flex items-center gap-1.5"> {/* Reduced pb, gap */}
        <form onSubmit={handleHeaderSearchSubmit} className="relative flex-grow">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary-foreground/60" /> {/* Adjusted icon pos */}
          <Input
            type="search"
            placeholder="Search cultivars..."
            value={searchTerm}
            onChange={handleHeaderSearchChange}
            className="pl-8 pr-2 py-1 h-8 text-xs w-full bg-primary/70 text-primary-foreground placeholder:text-primary-foreground/60 border-primary-foreground/40 focus:bg-primary/90 focus:border-primary-foreground/70 ring-offset-primary" /* Reduced h, py, pl, pr, text size */
            aria-label="Search cultivars on mobile"
          />
        </form>
        {isPublicBrowserPage && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsFilterModalOpen(true)}
              className={cn(
                "h-8 w-8 flex-shrink-0 bg-primary/70 border-primary-foreground/40 text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground relative", /* Reduced h, w */
                isFiltersActive && "ring-2 ring-offset-1 ring-offset-primary ring-accent"
              )}
              aria-label="Open filters on mobile"
            >
              <FilterIcon className="h-3.5 w-3.5" /> {/* Reduced icon size */}
              {isFiltersActive && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-accent border border-primary animate-pulse"></span> {/* Adjusted badge size/pos */}
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0 bg-primary/70 border-primary-foreground/40 text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" /* Reduced h, w */
                  aria-label="Sort options on mobile"
                >
                  {sortOption.endsWith('-asc') ? <SortAsc className="h-3.5 w-3.5" /> : <SortDesc className="h-3.5 w-3.5" />} {/* Reduced icon size */}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-background text-foreground"> {/* Reduced w */}
                <DropdownMenuLabel className="text-xs">Sort By</DropdownMenuLabel> {/* Reduced text size */}
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sortOption} onValueChange={handleSortChange}>
                  {SORT_OPTIONS_CONFIG.map(opt => (
                    <DropdownMenuRadioItem key={opt.value} value={opt.value} className="cursor-pointer text-xs">{opt.label}</DropdownMenuRadioItem> /* Reduced text size */
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
      <LoginModal isOpen={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
      <SubmitCultivarModal isOpen={isSubmitCultivarModalOpen} onOpenChange={setIsSubmitCultivarModalOpen} />
      <FilterModal isOpen={isFilterModalOpen} onOpenChange={setIsFilterModalOpen} />
    </header>
  );
}

    