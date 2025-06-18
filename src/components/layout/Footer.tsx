
import Link from 'next/link';
import { Shield, FileText } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground py-3 mt-auto">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs">
        {/* Copyright - Left */}
        <div className="text-center sm:text-left mb-2 sm:mb-0">
          <p>&copy; {new Date().getFullYear()} Highway101. All rights reserved.</p>
        </div>

        {/* Tagline - Center */}
        <div className="text-center mb-2 sm:mb-0">
          <p>Your trusted guide to cannabis cultivars.</p>
        </div>

        {/* Links - Right */}
        <div className="flex items-center space-x-3">
          <Link href="#" className="flex items-center hover:text-primary transition-colors">
            <Shield size={13} className="mr-1" />
            Privacy Policy
          </Link>
          <Link href="#" className="flex items-center hover:text-primary transition-colors">
            <FileText size={13} className="mr-1" />
            Terms & Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
}

