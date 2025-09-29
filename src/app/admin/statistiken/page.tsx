import { prisma } from '@/lib/db';
import StatisticsClient from './statistics-client';

export default async function StatisticsPage() {
  // Get comprehensive statistics
  const [
    totalProducts,
    totalOrders,
    totalRevenue,
    totalUsers,
    ordersByStatus,
    revenueByMonth,
    topProducts,
    recentOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { totalCents: true },
      where: { paymentStatus: 'PAID' },
    }),
    prisma.user.count(),
    prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    // Revenue by month (last 12 months)
    prisma.$queryRaw`
      SELECT 
        strftime('%Y-%m', createdAt) as month,
        SUM(totalCents) as revenue
      FROM Order 
      WHERE paymentStatus = 'PAID' 
        AND createdAt >= date('now', '-12 months')
      GROUP BY strftime('%Y-%m', createdAt)
      ORDER BY month DESC
    `,
    // Top products by order count
    prisma.orderItem.groupBy({
      by: ['variantId'],
      _sum: { qty: true },
      _count: { variantId: true },
      orderBy: { _sum: { qty: 'desc' } },
      take: 5,
    }),
    prisma.order.findMany({
      include: {
        user: true,
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  // Get product details for top products
  const topProductDetails = await Promise.all(
    topProducts.map(async (item) => {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      });
      return {
        ...item,
        product: variant?.product,
        variant: variant,
      };
    })
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📈 Statistiken</h1>
        <p className="text-gray-600">Übersicht über Ihre Geschäftsleistung</p>
      </div>

      <StatisticsClient
        stats={{
          totalProducts,
          totalOrders,
          totalRevenue: totalRevenue._sum.totalCents || 0,
          totalUsers,
          ordersByStatus,
          revenueByMonth: revenueByMonth as any[],
          topProducts: topProductDetails,
          recentOrders,
        }}
      />
    </div>
  );
}

