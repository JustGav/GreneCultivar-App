
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, LogIn, LogOut, UserCircle, Loader2, LayoutDashboard, PlusCircleIcon, Home, Search, Filter as FilterIcon, SortAsc, SortDesc } from 'lucide-react';
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
    console.log("Header search term:", searchTerm);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value as SortOption);
  }

  const isPublicBrowserPage = pathname === '/';

  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 flex-grow min-w-0">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
            <Leaf size={28} className="sm:size-32"/>
            <h1 className="text-2xl sm:text-3xl font-headline">GreneCultivar</h1>
          </Link>
          
          <div className="relative hidden md:flex items-center gap-2 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
            <form onSubmit={handleHeaderSearchSubmit} className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/60" />
              <Input
                type="search"
                placeholder="Search cultivars..."
                value={searchTerm}
                onChange={handleHeaderSearchChange}
                className="pl-10 pr-3 py-2 h-9 text-sm w-full bg-primary/70 text-primary-foreground placeholder:text-primary-foreground/60 border-primary-foreground/40 focus:bg-primary/90 focus:border-primary-foreground/70 ring-offset-primary"
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
                    "h-9 w-9 bg-primary/70 border-primary-foreground/40 text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground relative",
                    isFiltersActive && "ring-2 ring-offset-1 ring-offset-primary ring-accent"
                  )}
                  aria-label="Open filters"
                >
                  <FilterIcon className="h-4 w-4" />
                  {isFiltersActive && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-accent border-2 border-primary animate-pulse"></span>
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 bg-primary/70 border-primary-foreground/40 text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                      aria-label="Sort options"
                    >
                      {sortOption.endsWith('-asc') ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-background text-foreground">
                    <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={sortOption} onValueChange={handleSortChange}>
                      {SORT_OPTIONS_CONFIG.map(opt => (
                        <DropdownMenuRadioItem key={opt.value} value={opt.value} className="cursor-pointer">{opt.label}</DropdownMenuRadioItem>
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
            <Button variant="outline" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:text-primary" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </Button>
          ) : user ? (
            <div className="flex items-center gap-2">
              <Link href="/" passHref>
                <Button variant="outline" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:text-primary hidden sm:flex">
                  <Home className="mr-2 h-4 w-4" />
                  Public
                </Button>
              </Link>
              <Link href="/dashboard" passHref>
                <Button variant="outline" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:text-primary hidden sm:flex">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-primary/80 p-0">
                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'} />
                      <AvatarFallback>
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserCircle size={20}/>}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-background text-foreground" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.displayName || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="sm:hidden cursor-pointer">
                    <Link href="/">
                       <Home className="mr-2 h-4 w-4" />
                      Public Page
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="sm:hidden cursor-pointer">
                    <Link href="/dashboard">
                       <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="sm:hidden" />
                   <DropdownMenuItem onClick={() => setIsSubmitCultivarModalOpen(true)} className="cursor-pointer">
                    <PlusCircleIcon className="mr-2 h-4 w-4" />
                    Submit Cultivar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsSubmitCultivarModalOpen(true)}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:text-primary"
              >
                <PlusCircleIcon className="mr-2 h-4 w-4" />
                Submit
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:text-primary"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </div>
          )}
        </nav>
      </div>
      
      <div className="container mx-auto px-4 pb-2 md:hidden flex items-center gap-2">
        <form onSubmit={handleHeaderSearchSubmit} className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/60" />
          <Input
            type="search"
            placeholder="Search cultivars..."
            value={searchTerm}
            onChange={handleHeaderSearchChange}
            className="pl-10 pr-3 py-2 h-9 text-sm w-full bg-primary/70 text-primary-foreground placeholder:text-primary-foreground/60 border-primary-foreground/40 focus:bg-primary/90 focus:border-primary-foreground/70 ring-offset-primary"
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
                "h-9 w-9 flex-shrink-0 bg-primary/70 border-primary-foreground/40 text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground relative",
                isFiltersActive && "ring-2 ring-offset-1 ring-offset-primary ring-accent"
              )}
              aria-label="Open filters on mobile"
            >
              <FilterIcon className="h-4 w-4" />
              {isFiltersActive && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-accent border-2 border-primary animate-pulse"></span>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 flex-shrink-0 bg-primary/70 border-primary-foreground/40 text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                  aria-label="Sort options on mobile"
                >
                  {sortOption.endsWith('-asc') ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background text-foreground">
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sortOption} onValueChange={handleSortChange}>
                  {SORT_OPTIONS_CONFIG.map(opt => (
                    <DropdownMenuRadioItem key={opt.value} value={opt.value} className="cursor-pointer">{opt.label}</DropdownMenuRadioItem>
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

