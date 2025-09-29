'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="md:hidden">
      <button
        onClick={toggleMenu}
        className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        aria-label="Menü öffnen"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleMenu}
          />
          
          {/* Menu */}
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="text-lg font-semibold">Menü</span>
              <button
                onClick={toggleMenu}
                className="p-1 rounded-md text-gray-600 hover:text-gray-900"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <nav className="p-4 space-y-4">
              <Link
                href="/"
                onClick={toggleMenu}
                className="block py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                🏠 Start
              </Link>
              <Link
                href="/kaffee"
                onClick={toggleMenu}
                className="block py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                ☕ Kaffee
              </Link>
              <Link
                href="/warenkorb"
                onClick={toggleMenu}
                className="block py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                🛒 Warenkorb
              </Link>
              <Link
                href="/anmelden"
                onClick={toggleMenu}
                className="block py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                👤 Anmelden
              </Link>
              <Link
                href="/admin"
                onClick={toggleMenu}
                className="block py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                ⚙️ Admin
              </Link>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}

