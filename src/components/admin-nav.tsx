'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/produkte', label: 'Produkte', icon: '☕' },
  { href: '/admin/bestellungen', label: 'Bestellungen', icon: '📦' },
  { href: '/admin/benutzer', label: 'Benutzer', icon: '👥' },
  { href: '/admin/statistiken', label: 'Statistiken', icon: '📈' },
  { href: '/admin/einstellungen', label: 'Einstellungen', icon: '⚙️' },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="bg-white border-r border-gray-200 w-64 min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Admin Panel</h2>
        
        <nav className="space-y-2">
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <span className="text-lg">🏠</span>
            Zurück zum Shop
          </Link>
        </div>
      </div>
    </div>
  );
}

