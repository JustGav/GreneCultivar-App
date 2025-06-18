
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
      {/* Reduced py-3 to py-1.5, px-4 to px-2, gap-4 to gap-2 */}
      <div className="container mx-auto px-2 py-1.5 flex items-center justify-between gap-2">
        {/* Reduced gap-4 to gap-2 */}
        <div className="flex items-center gap-2 flex-grow min-w-0">
          {/* Reduced Leaf size to 22, h1 text-2xl to text-xl */}
          <Link href="/" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity flex-shrink-0">
            <Leaf size={22} />
            <h1 className="text-xl font-headline">GreneCultivar</h1>
          </Link>

          {/* Reduced search input h-10 to h-8, py-2 to py-1, text-sm to text-xs. Reduced icon size. */}
          <div className="relative hidden md:flex items-center gap-1.5 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
            <form onSubmit={handleHeaderSearchSubmit} className="relative flex-grow">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary-foreground/60" />
              <Input
                type="search"
                placeholder="Search cultivars..."
                value={searchTerm}
                onChange={handleHeaderSearchChange}
                className="pl-8 pr-2 py-1 h-8 text-xs w-full bg-primary/70 text-primary-foreground placeholder:text-primary-foreground/60 border-primary-foreground/40 focus:bg-primary/90 focus:border-primary-foreground/70 ring-offset-primary"
                aria-label="Search cultivars"
              />
            </form>
            {isPublicBrowserPage && (
              <>
                {/* Reduced filter/sort buttons h-10 w-10 to h-8 w-8, icon size h-5 w-5 to h-4 w-4 */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsFilterModalOpen(true)}
                  className={cn(
                    "h-8 w-8 bg-primary/70 border-primary-foreground/40 text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground relative",
                    isFiltersActive && "ring-2 ring-offset-1 ring-offset-primary ring-accent"
                  )}
                  aria-label="Open filters"
                >
                  <FilterIcon className="h-4 w-4" />
                  {isFiltersActive && (
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-accent border border-primary animate-pulse"></span>
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-primary/70 border-primary-foreground/40 text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                      aria-label="Sort options"
                    >
                      {sortOption.endsWith('-asc') ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-background text-foreground">
                    <DropdownMenuLabel className="text-xs">Sort By</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={sortOption} onValueChange={handleSortChange}>
                      {SORT_OPTIONS_CONFIG.map(opt => (
                        <DropdownMenuRadioItem key={opt.value} value={opt.value} className="cursor-pointer text-xs">{opt.label}</DropdownMenuRadioItem>
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
            <Button variant="outline" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:text-primary h-8 text-xs px-2" disabled>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Loading...
            </Button>
          ) : user ? (
            <div className="flex items-center gap-1.5">
              <Link href="/" passHref>
                <Button variant="outline" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:text-primary h-8 text-xs px-2 hidden sm:flex">
                  <Home className="mr-1.5 h-3.5 w-3.5" />
                  Public
                </Button>
              </Link>
              <Link href="/dashboard" passHref>
                <Button variant="outline" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:text-primary h-8 text-xs px-2 hidden sm:flex">
                  <LayoutDashboard className="mr-1.5 h-3.5 w-3.5" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/logs" passHref>
                <Button variant="outline" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:text-primary h-8 text-xs px-2 hidden sm:flex">
                  <LogIcon className="mr-1.5 h-3.5 w-3.5" />
                  Logs
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {/* Reduced avatar button h-10 w-10 to h-8 w-8 */}
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-primary/80 p-0">
                    {/* Reduced avatar size h-9 w-9 to h-7 w-7 */}
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'} />
                      <AvatarFallback className="text-xs">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserCircle size={14}/>}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-background text-foreground" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal text-xs">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-xs font-medium leading-none">
                        {user.displayName || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* Reduced icon sizes in dropdown */}
                  <DropdownMenuItem asChild className="sm:hidden cursor-pointer text-xs">
                    <Link href="/">
                       <Home className="mr-1.5 h-3.5 w-3.5" />
                      Public Page
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="sm:hidden cursor-pointer text-xs">
                    <Link href="/dashboard">
                       <LayoutDashboard className="mr-1.5 h-3.5 w-3.5" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild className="sm:hidden cursor-pointer text-xs">
                    <Link href="/logs">
                       <LogIcon className="mr-1.5 h-3.5 w-3.5" />
                      Audit Logs
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="sm:hidden" />
                   <DropdownMenuItem onClick={() => setIsSubmitCultivarModalOpen(true)} className="cursor-pointer text-xs">
                    <PlusCircleIcon className="mr-1.5 h-3.5 w-3.5" />
                    Submit Cultivar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive text-xs">
                    <LogOut className="mr-1.5 h-3.5 w-3.5" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {/* Reduced button heights to h-8, text-xs */}
              <Button
                variant="outline"
                onClick={() => setIsSubmitCultivarModalOpen(true)}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:text-primary h-8 text-xs px-2"
              >
                <PlusCircleIcon className="mr-1.5 h-3.5 w-3.5" />
                Submit
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:text-primary h-8 text-xs px-2"
              >
                <LogIn className="mr-1.5 h-3.5 w-3.5" />
                Login
              </Button>
            </div>
          )}
        </nav>
      </div>

      {/* Mobile search section - Reduced pb-2 to pb-1, gap-2 to gap-1.5 */}
      <div className="container mx-auto px-2 pb-1 md:hidden flex items-center gap-1.5">
        {/* Reduced search input h-10 to h-8, py-2 to py-1, text-sm to text-xs */}
        <form onSubmit={handleHeaderSearchSubmit} className="relative flex-grow">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary-foreground/60" />
          <Input
            type="search"
            placeholder="Search cultivars..."
            value={searchTerm}
            onChange={handleHeaderSearchChange}
            className="pl-8 pr-2 py-1 h-8 text-xs w-full bg-primary/70 text-primary-foreground placeholder:text-primary-foreground/60 border-primary-foreground/40 focus:bg-primary/90 focus:border-primary-foreground/70 ring-offset-primary"
            aria-label="Search cultivars on mobile"
          />
        </form>
        {isPublicBrowserPage && (
          <>
            {/* Reduced filter/sort buttons h-10 w-10 to h-8 w-8, icon size h-5 w-5 to h-4 w-4 */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsFilterModalOpen(true)}
              className={cn(
                "h-8 w-8 flex-shrink-0 bg-primary/70 border-primary-foreground/40 text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground relative",
                isFiltersActive && "ring-2 ring-offset-1 ring-offset-primary ring-accent"
              )}
              aria-label="Open filters on mobile"
            >
              <FilterIcon className="h-4 w-4" />
              {isFiltersActive && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-accent border border-primary animate-pulse"></span>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0 bg-primary/70 border-primary-foreground/40 text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                  aria-label="Sort options on mobile"
                >
                  {sortOption.endsWith('-asc') ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-background text-foreground">
                <DropdownMenuLabel className="text-xs">Sort By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sortOption} onValueChange={handleSortChange}>
                  {SORT_OPTIONS_CONFIG.map(opt => (
                    <DropdownMenuRadioItem key={opt.value} value={opt.value} className="cursor-pointer text-xs">{opt.label}</DropdownMenuRadioItem>
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
