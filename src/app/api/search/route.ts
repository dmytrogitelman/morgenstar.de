import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');
  const category = searchParams.get('category');
  const brand = searchParams.get('brand');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const sortBy = searchParams.get('sortBy') || 'title';
  const sortOrder = searchParams.get('sortOrder') || 'asc';

  if (!query || query.trim().length < 2) {
    return Response.json({ products: [], total: 0 });
  }

  // Build where clause
  const where: any = {
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { subtitle: { contains: query, mode: 'insensitive' } }
    ]
  };

  if (category) {
    where.categories = {
      some: {
        slug: category
      }
    };
  }

  if (brand) {
    where.brand = {
      slug: brand
    };
  }

  // Price filtering based on variants
  if (minPrice || maxPrice) {
    where.variants = {
      some: {}
    };
    if (minPrice) {
      where.variants.some.priceCents = { ...where.variants.some.priceCents, gte: parseInt(minPrice) * 100 };
    }
    if (maxPrice) {
      where.variants.some.priceCents = { ...where.variants.some.priceCents, lte: parseInt(maxPrice) * 100 };
    }
  }

  // Build orderBy clause
  let orderBy: any = {};
  if (sortBy === 'price') {
    orderBy = {
      variants: {
        _count: 'asc'
      }
    };
  } else if (sortBy === 'rating') {
    orderBy = {
      ratingAvg: sortOrder === 'asc' ? 'asc' : 'desc'
    };
  } else {
    orderBy = {
      [sortBy]: sortOrder
    };
  }

  try {
    const products = await prisma.product.findMany({
      where,
      include: {
        variants: true,
        brand: true,
        categories: true
      },
      orderBy,
      take: 50
    });

    // Get total count for pagination
    const total = await prisma.product.count({ where });

    return Response.json({
      products,
      total,
      query
    });
  } catch (error) {
    console.error('Search error:', error);
    return Response.json({ products: [], total: 0, error: 'Search failed' }, { status: 500 });
  }
}


