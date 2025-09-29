import { prisma } from '@/lib/db';
import ProductDetailClient from './product-detail-client';

export default async function Page({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { 
      variants: true, 
      brand: true, 
      categories: true,
      reviews: {
        where: { verified: true },
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    },
  });

  if (!product) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-600">Produkt nicht gefunden</h1>
        <p className="mt-2 text-gray-500">Das gesuchte Produkt konnte nicht gefunden werden.</p>
      </div>
    );
  }

  return <ProductDetailClient product={product} />;
}

