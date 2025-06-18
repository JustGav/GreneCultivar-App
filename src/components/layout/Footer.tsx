
import Link from 'next/link';
import { Shield, FileText } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground py-6 mt-auto">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between">
        <div className="text-center sm:text-left mb-4 sm:mb-0">
          <p className="text-sm">&copy; {new Date().getFullYear()} GreneCultivar. All rights reserved.</p>
          <p className="text-xs mt-1">Your trusted guide to cannabis cultivars.</p>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="#" className="flex items-center text-xs hover:text-primary transition-colors">
            <Shield size={14} className="mr-1.5" />
            Privacy Policy
          </Link>
          <Link href="#" className="flex items-center text-xs hover:text-primary transition-colors">
            <FileText size={14} className="mr-1.5" />
            Terms & Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
}
