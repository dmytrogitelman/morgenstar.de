import { prisma } from './db';

// Optimized product queries with proper includes
export const productQueries = {
  // Get products for listing pages (minimal data)
  async getProductsForListing() {
    return prisma.product.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        subtitle: true,
        description: true,
        ratingAvg: true,
        ratingCnt: true,
        variants: {
          select: {
            priceCents: true,
            currency: true,
          },
          orderBy: {
            priceCents: 'asc',
          },
        },
        brand: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  // Get single product with full details
  async getProductBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        variants: {
          orderBy: {
            priceCents: 'asc',
          },
        },
        brand: true,
        categories: true,
        reviews: {
          where: { verified: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  },

  // Get featured products for homepage
  async getFeaturedProducts(limit = 6) {
    return prisma.product.findMany({
      where: {
        ratingAvg: {
          gte: 4.0, // Only products with 4+ stars
        },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        subtitle: true,
        description: true,
        ratingAvg: true,
        ratingCnt: true,
        variants: {
          select: {
            priceCents: true,
            currency: true,
          },
          orderBy: {
            priceCents: 'asc',
          },
          take: 1, // Only need the cheapest variant for listing
        },
        brand: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        ratingAvg: 'desc',
      },
      take: limit,
    });
  },
};

// Cart queries
export const cartQueries = {
  async getCartWithItems(cartId: string) {
    return prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    brand: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  },

  async getCartItemCount(cartId: string) {
    const result = await prisma.cartItem.aggregate({
      where: { cartId },
      _sum: {
        qty: true,
      },
    });
    return result._sum.qty || 0;
  },
};
