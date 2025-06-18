import Link from 'next/link';
import { Leaf } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Leaf size={32} />
          <h1 className="text-3xl font-headline">CannaDex</h1>
        </Link>
        <nav>
          <Link href="/" className="hover:text-accent transition-colors font-medium">
            Browse Cultivars
          </Link>
        </nav>
      </div>
    </header>
  );
}
