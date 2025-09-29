import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // const session = await getServerSession(authOptions);
    
    // if (!session?.user?.id) {
    //   return NextResponse.json(
    //     { error: 'Nicht autorisiert' },
    //     { status: 401 }
    //   );
    // }

    // TODO: Add admin role check
    // For now, we'll allow any logged-in user to access admin stats

    // Get statistics
    const [
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders
    ] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: {
          totalCents: true
        }
      }),
      prisma.order.count({
        where: {
          status: 'PENDING'
        }
      })
    ]);

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalCents || 0,
      pendingOrders
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Statistiken' },
      { status: 500 }
    );
  }
}
