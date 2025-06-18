
'use client';

import Link from 'next/link';
import { Leaf, LogIn, LogOut, UserCircle, Loader2, LayoutDashboard, PlusCircleIcon, Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from 'react';
import LoginModal from '@/components/auth/LoginModal';
import SubmitCultivarModal from '@/components/auth/SubmitCultivarModal';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, loading, logout } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSubmitCultivarModalOpen, setIsSubmitCultivarModalOpen] = useState(false);
  const [headerSearchTerm, setHeaderSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (user && isLoginModalOpen) {
      setIsLoginModalOpen(false); // Close login modal on successful login
    }
  }, [user, isLoginModalOpen]);

  const handleHeaderSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeaderSearchTerm(e.target.value);
  };

  // Optional: Handle search submission, e.g., on Enter key
  const handleHeaderSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (headerSearchTerm.trim()) {
      // Example: Redirect to a search results page or handle search globally
      // router.push(`/search?q=${encodeURIComponent(headerSearchTerm.trim())}`);
      console.log("Header search submitted:", headerSearchTerm);
      // For now, it just logs. Actual search filtering would need further implementation.
    }
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 flex-grow min-w-0">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
            <Leaf size={28} className="sm:size-32"/>
            <h1 className="text-2xl sm:text-3xl font-headline">GreneCultivar</h1>
          </Link>
          <form onSubmit={handleHeaderSearchSubmit} className="relative w-full max-w-xs sm:max-w-sm md:max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/60" />
            <Input
              type="search"
              placeholder="Search cultivars..."
              value={headerSearchTerm}
              onChange={handleHeaderSearchChange}
              className="pl-10 pr-3 py-2 h-9 text-sm w-full bg-primary/70 text-primary-foreground placeholder:text-primary-foreground/60 border-primary-foreground/40 focus:bg-primary/90 focus:border-primary-foreground/70 ring-offset-primary"
              aria-label="Search cultivars"
            />
          </form>
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
       {/* Search bar for mobile, revealed below header or as part of a mobile menu if needed */}
      <div className="container mx-auto px-4 pb-2 md:hidden">
        <form onSubmit={handleHeaderSearchSubmit} className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/60" />
          <Input
            type="search"
            placeholder="Search cultivars..."
            value={headerSearchTerm}
            onChange={handleHeaderSearchChange}
            className="pl-10 pr-3 py-2 h-9 text-sm w-full bg-primary/70 text-primary-foreground placeholder:text-primary-foreground/60 border-primary-foreground/40 focus:bg-primary/90 focus:border-primary-foreground/70 ring-offset-primary"
            aria-label="Search cultivars on mobile"
          />
        </form>
      </div>
      <LoginModal isOpen={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
      <SubmitCultivarModal isOpen={isSubmitCultivarModalOpen} onOpenChange={setIsSubmitCultivarModalOpen} />
    </header>
  );
}
