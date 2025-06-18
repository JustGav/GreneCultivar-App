
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Loader2, Mail, Lock, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoginModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginModal({ isOpen, onOpenChange }: LoginModalProps) {
  const { loginWithEmailPassword, loginWithGoogle, loading: authLoading } = useAuth();
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [isSubmittingGoogle, setIsSubmittingGoogle] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleEmailLogin = async (data: LoginFormData) => {
    setIsSubmittingEmail(true);
    const success = await loginWithEmailPassword(data.email, data.password);
    setIsSubmittingEmail(false);
    if (success) {
      reset(); // Reset form on successful login
      onOpenChange(false); // Close modal
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmittingGoogle(true);
    await loginWithGoogle();
    setIsSubmittingGoogle(false);
    // The modal will close automatically if loginWithGoogle is successful due to user state change in Header
  };

  const isLoading = isSubmittingEmail || isSubmittingGoogle || authLoading;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!isLoading) { // Prevent closing while an auth operation is in progress
        onOpenChange(open);
        if (!open) reset(); // Reset form when modal is closed
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <LogIn className="mr-2 h-5 w-5" /> Login to GreneCultivar
          </DialogTitle>
          <DialogDescription>
            Access your account to manage cultivars or sign up.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleEmailLogin)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="pl-10"
                {...register('email')}
                disabled={isLoading}
              />
            </div>
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
             <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                {...register('password')}
                disabled={isLoading}
              />
            </div>
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isSubmittingEmail ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="mr-2 h-4 w-4" />
            )}
            Login with Email
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
          {isSubmittingGoogle ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            // Using a simple SVG for Google icon as lucide-react doesn't have one
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.5 512 0 401.5 0 265.5S110.5 19 244 19c70.5 0 132.5 30.5 176.5 78.5l-66 66C314.5 134.5 282.5 119 244 119c-69 0-125.5 56.5-125.5 125.5S175 370.5 244 370.5c45.5 0 80.5-22.5 98.5-40.5l67 67C400.5 459.5 329 512 244 512z"></path>
            </svg>
          )}
          Login with Google
        </Button>

        <DialogFooter className="mt-4 sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="ghost" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
