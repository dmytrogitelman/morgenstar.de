import { prisma } from '@/lib/db';
import SearchClient from './search-client';
import Breadcrumbs from '@/components/breadcrumbs';

interface SearchPageProps {
  searchParams: {
    q?: string;
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const category = searchParams.category || '';
  const brand = searchParams.brand || '';
  const minPrice = parseFloat(searchParams.minPrice || '0');
  const maxPrice = parseFloat(searchParams.maxPrice || '999999');
  const sortBy = searchParams.sortBy || 'createdAt_desc';

  // Get categories and brands for filters
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    }),
    prisma.brand.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  // Build where clause
  const where: any = {
    AND: [
      query ? {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { subtitle: { contains: query, mode: 'insensitive' } },
        ],
      } : {},
      category ? { categories: { some: { slug: category } } } : {},
      brand ? { brand: { slug: brand } } : {},
    ].filter(Boolean),
  };

  // Build orderBy
  let orderBy: any = { createdAt: 'desc' };
  if (sortBy === 'price_asc') {
    orderBy = { variants: { _min: { priceCents: 'asc' } } };
  } else if (sortBy === 'price_desc') {
    orderBy = { variants: { _min: { priceCents: 'desc' } } };
  } else if (sortBy === 'title_asc') {
    orderBy = { title: 'asc' };
  } else if (sortBy === 'title_desc') {
    orderBy = { title: 'desc' };
  } else if (sortBy === 'rating_desc') {
    orderBy = { ratingAvg: 'desc' };
  }

  // Get products
  const products = await prisma.product.findMany({
    where,
    include: {
      variants: {
        orderBy: { priceCents: 'asc' },
      },
      brand: true,
      categories: true,
    },
    orderBy,
  });

  // Manual price filtering
  const filteredProducts = products.filter(product => {
    const minVariantPrice = Math.min(...product.variants.map(v => v.priceCents));
    return minVariantPrice >= minPrice * 100 && minVariantPrice <= maxPrice * 100;
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={[{ label: 'Suche' }]} />
      
      <SearchClient
        initialProducts={filteredProducts}
        initialQuery={query}
        categories={categories}
        brands={brands}
        initialFilters={{
          category,
          brand,
          minPrice,
          maxPrice,
          sortBy,
        }}
      />
    </div>
  );
}