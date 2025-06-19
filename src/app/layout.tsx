
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/contexts/AuthContext';
import { FilterProvider } from '@/contexts/FilterContext';
import { FeatureToggleProvider } from '@/contexts/FeatureToggleContext'; // Import FeatureToggleProvider

export const metadata: Metadata = {
  title: 'Grene.Life Seedbank',
  description: 'Categorize, review, and explore cannabis cultivars at Grene.Life Seedbank.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("min-h-screen bg-background font-body antialiased flex flex-col")}>
        <AuthProvider>
          <FeatureToggleProvider> {/* Wrap with FeatureToggleProvider */}
            <FilterProvider>
              <Header />
              <main className="flex-grow container mx-auto px-4 pt-12 pb-12 overflow-y-auto">
                {children}
              </main>
              <Footer />
              <Toaster />
            </FilterProvider>
          </FeatureToggleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
