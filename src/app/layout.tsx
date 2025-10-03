import '../styles/globals.css';
import type { ReactNode } from 'react';
import CartIcon from '@/components/cart-icon';
import SearchBar from '@/components/search-bar';
import UserMenu from '@/components/user-menu';
import AuthSessionProvider from '@/components/session-provider';
import MobileMenu from '@/components/mobile-menu';
import { ThemeProvider } from '@/components/theme-provider';
import Analytics from '@/components/analytics';

export const metadata = { title: 'Morgenstar', description: 'Kaffee shop' };
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <ThemeProvider
          defaultTheme="system"
          storageKey="morgenstar-theme"
        >
          <AuthSessionProvider>
            <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-50">
              <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <a href="/" className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Morgenstar
                  </a>
                  <nav className="hidden md:flex text-sm text-gray-600 dark:text-gray-400 gap-6">
                    <a href="/kaffee" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                      Kaffee
                    </a>
                    <a href="/warenkorb" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                      Warenkorb
                    </a>
                    <a href="/wunschliste" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                      Wunschliste
                    </a>
                    <a href="/admin" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                      Admin
                    </a>
                  </nav>
                </div>
                
                <div className="flex items-center gap-4">
                  <SearchBar />
                  <CartIcon />
                  <UserMenu />
                  <MobileMenu />
                </div>
              </div>
            </header>
            <main>{children}</main>
            <Analytics />
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

