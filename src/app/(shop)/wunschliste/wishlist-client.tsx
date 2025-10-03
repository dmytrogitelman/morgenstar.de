'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface WishlistItem {
  id: string;
  createdAt: Date;
  product: {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    imageUrl: string | null;
    brand: {
      name: string;
    } | null;
    variants: {
      id: string;
      name: string;
      priceCents: number;
      currency: string;
      inStock: number;
    }[];
    categories: {
      name: string;
    }[];
  };
}

interface WishlistClientProps {
  wishlist: WishlistItem[];
}

export default function WishlistClient({ wishlist }: WishlistClientProps) {
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const router = useRouter();

  const formatPrice = (priceCents: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency,
    }).format(priceCents / 100);
  };

  const removeFromWishlist = async (productId: string) => {
    setRemovingItems(prev => new Set(prev).add(productId));
    
    try {
      const response = await fetch(`/api/wishlist?productId=${productId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">💖</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Ihre Wunschliste ist leer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Fügen Sie Produkte zu Ihrer Wunschliste hinzu, um sie später zu kaufen.
          </p>
          <Link
            href="/kaffee"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Kaffee entdecken
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          💖 Meine Wunschliste
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {wishlist.length} {wishlist.length === 1 ? 'Produkt' : 'Produkte'} in Ihrer Wunschliste
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {wishlist.map((item) => {
          const product = item.product;
          const cheapestVariant = product.variants[0];
          const isRemoving = removingItems.has(product.id);

          return (
            <div
              key={item.id}
              className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                isRemoving ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <div className="aspect-square relative mb-4 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-2">☕</div>
                  <p className="text-xs">Produktbild</p>
                </div>
              </div>

              <div className="space-y-3">
                {product.brand && (
                  <p className="text-amber-600 dark:text-amber-400 text-sm font-medium">
                    {product.brand.name}
                  </p>
                )}

                <Link
                  href={`/produkt/${product.slug}`}
                  className="block group"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {product.title}
                  </h3>
                  {product.subtitle && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {product.subtitle}
                    </p>
                  )}
                </Link>

                <div className="flex flex-wrap gap-1">
                  {product.categories.slice(0, 2).map((category) => (
                    <span
                      key={category.name}
                      className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded text-xs"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {formatPrice(cheapestVariant.priceCents, cheapestVariant.currency)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ab {cheapestVariant.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      disabled={isRemoving}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Aus Wunschliste entfernen"
                    >
                      <span className="text-lg">♥</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/produkt/${product.slug}`}
                    className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Ansehen
                  </Link>
                  <button
                    onClick={() => {
                      // Add to cart logic would go here
                      console.log('Add to cart:', product.id);
                    }}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    In Warenkorb
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/kaffee"
          className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Weitere Produkte entdecken
        </Link>
      </div>
    </div>
  );
}
