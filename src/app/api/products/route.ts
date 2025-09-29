import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: true,
        brand: true,
        categories: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return Response.json({ products });

  } catch (error) {
    console.error('Products fetch error:', error);
    return Response.json(
      { error: 'Fehler beim Laden der Produkte' },
      { status: 500 }
    );
  }
}


