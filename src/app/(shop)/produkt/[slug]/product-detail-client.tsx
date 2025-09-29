'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductVariant {
  id: string;
  name: string;
  priceCents: number;
  currency: string;
  inStock: number;
  weightGr?: number;
}

interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Review {
  id: string;
  rating: number;
  title?: string;
  body?: string;
  createdAt: string;
}

interface Product {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  variants: ProductVariant[];
  brand?: Brand;
  categories: Category[];
  ratingAvg?: number;
  ratingCnt: number;
  reviews: Review[];
}

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    
    setIsAddingToCart(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variantId: selectedVariant.id,
          qty: quantity,
        }),
      });

      if (response.ok) {
        // Erfolgs-Feedback (könnte später durch einen Toast ersetzt werden)
        alert(`${quantity}x ${selectedVariant.name} wurde zum Warenkorb hinzugefügt!`);
      } else {
        alert('Fehler beim Hinzufügen zum Warenkorb');
      }
    } catch (error) {
      alert('Fehler beim Hinzufügen zum Warenkorb');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const formatPrice = (priceCents: number) => {
    return (priceCents / 100).toFixed(2);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<span key={i} className="text-gray-300">☆</span>);
    }
    return stars;
  };

  return (
    <div className="container mx-auto p-4 sm:p-6">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <a href="/" className="hover:text-gray-900">Home</a>
          <span>/</span>
          <a href="/kaffee" className="hover:text-gray-900">Kaffee</a>
          {product.categories.length > 0 && (
            <>
              <span>/</span>
              <span>{product.categories[0].name}</span>
            </>
          )}
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Produktbild */}
        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-6xl mb-4">☕</div>
            <p>Produktbild</p>
          </div>
        </div>

        {/* Produktinformationen */}
        <div>
          {product.brand && (
            <div className="text-sm text-gray-600 mb-2">{product.brand.name}</div>
          )}
          
          <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
          
          {product.subtitle && (
            <p className="text-lg text-gray-600 mb-4">{product.subtitle}</p>
          )}

          {/* Bewertungen */}
          {product.ratingCnt > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {renderStars(product.ratingAvg || 0)}
              </div>
              <span className="text-sm text-gray-600">
                {product.ratingAvg?.toFixed(1)} ({product.ratingCnt} Bewertungen)
              </span>
            </div>
          )}

          {/* Preis */}
          {selectedVariant && (
            <div className="text-3xl font-bold text-green-600 mb-6">
              {formatPrice(selectedVariant.priceCents)} €
            </div>
          )}

          {/* Varianten-Auswahl */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Variante wählen:</h3>
            <div className="grid grid-cols-1 gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    selectedVariant?.id === variant.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{variant.name}</div>
                      {variant.weightGr && (
                        <div className="text-sm text-gray-600">{variant.weightGr}g</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatPrice(variant.priceCents)} €</div>
                      <div className="text-sm text-gray-600">
                        {variant.inStock > 0 ? `${variant.inStock} verfügbar` : 'Ausverkauft'}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Menge und Add to Cart */}
          {selectedVariant && selectedVariant.inStock > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <label className="text-lg font-semibold">Menge:</label>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(selectedVariant.inStock, quantity + 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? 'Wird hinzugefügt...' : 'In den Warenkorb'}
              </button>
            </div>
          )}

          {/* Beschreibung */}
          {product.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Beschreibung</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Kategorien */}
          {product.categories.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Kategorien</h3>
              <div className="flex flex-wrap gap-2">
                {product.categories.map((category) => (
                  <span
                    key={category.id}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bewertungen */}
      {product.reviews.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Kundenbewertungen</h2>
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {new Date(review.createdAt).toLocaleDateString('de-DE')}
                  </span>
                </div>
                {review.title && (
                  <h4 className="font-semibold mb-2">{review.title}</h4>
                )}
                {review.body && (
                  <p className="text-gray-700">{review.body}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


