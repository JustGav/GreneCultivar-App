
'use client';

import Link from 'next/link';
import { Leaf, LogIn, LogOut, UserCircle, Loader2, LayoutDashboard, PlusCircleIcon, Home } from 'lucide-react';
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

export default function Header() {
  const { user, loading, logout } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSubmitCultivarModalOpen, setIsSubmitCultivarModalOpen] = useState(false);

  useEffect(() => {
    if (user && isLoginModalOpen) {
      setIsLoginModalOpen(false); // Close login modal on successful login
    }
  }, [user, isLoginModalOpen]);

  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Leaf size={32} />
          <h1 className="text-3xl font-headline">GreneCultivar</h1>
        </Link>
        <nav>
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
                  Public Page
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
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-primary/80 p-0">
                    <Avatar className="h-9 w-9">
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
                  <DropdownMenuItem asChild className="sm:hidden">
                    <Link href="/" className="cursor-pointer">
                       <Home className="mr-2 h-4 w-4" />
                      Public Page
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="sm:hidden">
                    <Link href="/dashboard" className="cursor-pointer">
                       <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="sm:hidden" />
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
                Submit a Cultivar
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
      <LoginModal isOpen={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
      <SubmitCultivarModal isOpen={isSubmitCultivarModalOpen} onOpenChange={setIsSubmitCultivarModalOpen} />
    </header>
  );
}
