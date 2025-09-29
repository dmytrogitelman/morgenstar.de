'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/product-card';

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
  categories: {
    name: string;
  }[];
  ratingAvg?: number;
  ratingCnt?: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface Filters {
  category: string;
  brand: string;
  minPrice: number;
  maxPrice: number;
  sortBy: string;
}

interface SearchClientProps {
  initialProducts: Product[];
  initialQuery: string;
  categories: Category[];
  brands: Brand[];
  initialFilters: Filters;
}

export default function SearchClient({
  initialProducts,
  initialQuery,
  categories,
  brands,
  initialFilters,
}: SearchClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const updateURL = (newQuery: string, newFilters: Filters) => {
    const params = new URLSearchParams();
    if (newQuery) params.set('q', newQuery);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.brand) params.set('brand', newFilters.brand);
    if (newFilters.minPrice > 0) params.set('minPrice', newFilters.minPrice.toString());
    if (newFilters.maxPrice < 999999) params.set('maxPrice', newFilters.maxPrice.toString());
    if (newFilters.sortBy !== 'createdAt_desc') params.set('sortBy', newFilters.sortBy);
    
    const newURL = params.toString() ? `/suche?${params.toString()}` : '/suche';
    router.push(newURL);
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (filters.category) params.set('category', filters.category);
      if (filters.brand) params.set('brand', filters.brand);
      if (filters.minPrice > 0) params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice < 999999) params.set('maxPrice', filters.maxPrice.toString());
      if (filters.sortBy !== 'createdAt_desc') params.set('sortBy', filters.sortBy);

      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string | number) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateURL(query, newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      brand: '',
      minPrice: 0,
      maxPrice: 999999,
      sortBy: 'createdAt_desc',
    };
    setFilters(clearedFilters);
    setQuery('');
    router.push('/suche');
  };

  useEffect(() => {
    handleSearch();
  }, [filters]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {query ? `Suchergebnisse für "${query}"` : 'Produktsuche'}
        </h1>
        
        {/* Search Input */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Kaffee suchen..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Suche...' : 'Suchen'}
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Alle Kategorien</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marke</label>
            <select
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Alle Marken</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.slug}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min. Preis (€)</label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max. Preis (€)</label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', parseFloat(e.target.value) || 999999)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sortieren</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt_desc">Neueste zuerst</option>
              <option value="createdAt_asc">Älteste zuerst</option>
              <option value="price_asc">Preis: Niedrig zu Hoch</option>
              <option value="price_desc">Preis: Hoch zu Niedrig</option>
              <option value="title_asc">Name: A-Z</option>
              <option value="title_desc">Name: Z-A</option>
              <option value="rating_desc">Bewertung: Beste zuerst</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            {products.length} Produkt{products.length !== 1 ? 'e' : ''} gefunden
          </p>
          <button
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Filter zurücksetzen
          </button>
        </div>
      </div>

      {/* Results */}
      {products.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Keine Produkte gefunden
          </h3>
          <p className="text-gray-600 mb-4">
            Versuchen Sie es mit anderen Suchbegriffen oder passen Sie Ihre Filter an.
          </p>
          <button
            onClick={clearFilters}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Alle Filter zurücksetzen
          </button>
        </div>
      )}
    </div>
  );
}