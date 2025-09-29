import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import OrderConfirmation from './order-confirmation';

export default async function OrderSuccessPage({ 
  params 
}: { 
  params: { orderId: string } 
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect('/anmelden');
  }

  const order = await prisma.order.findUnique({
    where: { 
      id: params.orderId,
      userId: session.user.id // Ensure user can only see their own orders
    },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  brand: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!order) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-600">Bestellung nicht gefunden</h1>
        <p className="mt-2 text-gray-500">Die angeforderte Bestellung konnte nicht gefunden werden.</p>
      </div>
    );
  }

  return <OrderConfirmation order={order} />;
}


