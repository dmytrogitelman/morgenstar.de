import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import OrdersClient from './orders-client';

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/anmelden?callbackUrl=/bestellungen');
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Meine Bestellungen</h1>
      <OrdersClient />
    </div>
  );
}


