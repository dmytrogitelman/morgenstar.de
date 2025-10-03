import Image from 'next/image';
import Link from 'next/link';
import WishlistButton from './wishlist-button';

interface Product {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  variants: {
    priceCents: number;
    currency: string;
  }[];
  brand?: {
    name: string;
  };
  ratingAvg?: number;
  ratingCnt?: number;
}

export default function ProductCard({ product }: { product: Product }) {
  const minPrice = Math.min(...product.variants.map(v => v.priceCents));
  const maxPrice = Math.max(...product.variants.map(v => v.priceCents));
  const hasPriceRange = minPrice !== maxPrice;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  return (
    <Link href={`/produkt/${product.slug}`} className="block group">
      <div className="border rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
        <div className="aspect-square relative mb-4 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">☕</div>
            <p className="text-xs">Produktbild</p>
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
          
          {/* Wishlist Button */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <WishlistButton productId={product.id} />
          </div>
        </div>
        
        <div className="space-y-2">
          {product.brand && (
            <p className="text-amber-600 text-sm font-medium">{product.brand.name}</p>
          )}
          
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-amber-600 transition-colors">
            {product.title}
          </h3>
          
          {(product.subtitle || product.description) && (
            <p className="text-gray-600 text-sm line-clamp-2">
              {product.subtitle || product.description}
            </p>
          )}
          
          {/* Rating */}
          {product.ratingAvg && product.ratingCnt && (
            <div className="flex items-center gap-2">
              <div className="flex text-sm">
                {renderStars(product.ratingAvg)}
              </div>
              <span className="text-gray-500 text-sm">
                ({product.ratingCnt} {product.ratingCnt === 1 ? 'Bewertung' : 'Bewertungen'})
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2">
            <div className="font-bold text-xl text-gray-900">
              {hasPriceRange ? (
                <span>
                  ab {(minPrice / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </span>
              ) : (
                <span>{(minPrice / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
              )}
            </div>
            <div className="text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

