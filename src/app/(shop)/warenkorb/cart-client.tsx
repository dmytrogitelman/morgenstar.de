'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CartItem {
  id: string;
  qty: number;
  variant: {
    id: string;
    name: string;
    priceCents: number;
    currency: string;
    product: {
      id: string;
      title: string;
      slug: string;
      brand?: {
        name: string;
      };
    };
  };
}

interface CartData {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export default function CartClient() {
  const [cartData, setCartData] = useState<CartData>({ items: [], total: 0, itemCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        setCartData(data);
      }
    } catch (error) {
      console.error('Fehler beim Laden des Warenkorbs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1) return;

    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId, qty: newQty }),
      });

      if (response.ok) {
        await fetchCart();
      } else {
        alert('Fehler beim Aktualisieren der Menge');
      }
    } catch (error) {
      alert('Fehler beim Aktualisieren der Menge');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const removeItem = async (itemId: string) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    try {
      const response = await fetch(`/api/cart?itemId=${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCart();
      } else {
        alert('Fehler beim Entfernen des Artikels');
      }
    } catch (error) {
      alert('Fehler beim Entfernen des Artikels');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const formatPrice = (priceCents: number) => {
    return (priceCents / 100).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-gray-600">Warenkorb wird geladen...</div>
      </div>
    );
  }

  if (cartData.items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">Ihr Warenkorb ist leer</h2>
        <p className="text-gray-500 mb-6">Entdecken Sie unsere leckeren Kaffees und fügen Sie sie zu Ihrem Warenkorb hinzu.</p>
        <Link 
          href="/kaffee"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Kaffee entdecken
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Warenkorb-Artikel */}
      <div className="lg:col-span-2">
        <div className="space-y-4">
          {cartData.items.map((item) => (
            <div key={item.id} className="border rounded-lg p-4">
              <div className="flex items-start gap-4">
                {/* Produktbild */}
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="text-2xl">☕</div>
                </div>

                {/* Produktinformationen */}
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/produkt/${item.variant.product.slug}`}
                    className="text-lg font-semibold hover:text-blue-600"
                  >
                    {item.variant.product.title}
                  </Link>
                  {item.variant.product.brand && (
                    <p className="text-sm text-gray-600">{item.variant.product.brand.name}</p>
                  )}
                  <p className="text-sm text-gray-600">{item.variant.name}</p>
                  <p className="text-lg font-semibold text-green-600 mt-2">
                    {formatPrice(item.variant.priceCents)} €
                  </p>
                </div>

                {/* Mengenverwaltung */}
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.qty - 1)}
                      disabled={updatingItems.has(item.id)}
                      className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x min-w-[3rem] text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.qty + 1)}
                      disabled={updatingItems.has(item.id)}
                      className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold">
                      {formatPrice(item.variant.priceCents * item.qty)} €
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={updatingItems.has(item.id)}
                    className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                  >
                    {updatingItems.has(item.id) ? '...' : 'Entfernen'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bestellübersicht */}
      <div className="lg:col-span-1">
        <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
          <h3 className="text-xl font-semibold mb-4">Bestellübersicht</h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span>Zwischensumme ({cartData.itemCount} Artikel)</span>
              <span>{formatPrice(cartData.total)} €</span>
            </div>
            <div className="flex justify-between">
              <span>Versand</span>
              <span className="text-green-600">Kostenlos</span>
            </div>
            <hr />
            <div className="flex justify-between text-lg font-semibold">
              <span>Gesamt</span>
              <span>{formatPrice(cartData.total)} €</span>
            </div>
          </div>

          <Link
            href="/kasse"
            className="block w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 text-center mb-4"
          >
            Zur Kasse gehen
          </Link>

          <Link 
            href="/kaffee"
            className="block w-full text-center text-blue-600 hover:text-blue-800 py-2"
          >
            Weiter einkaufen
          </Link>
        </div>
      </div>
    </div>
  );
}
