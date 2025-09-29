// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
// import { redirect } from 'next/navigation';
import OrderManagement from './order-management';

export default async function AdminOrdersPage() {
  // const session = await getServerSession(authOptions);
  
  // if (!session?.user?.id) {
  //   redirect('/anmelden?callbackUrl=/admin/bestellungen');
  // }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Bestellverwaltung</h1>
      <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 mb-6">
        <p className="text-yellow-800">
          <strong>Hinweis:</strong> Admin-Funktionen sind temporär deaktiviert, da die Authentifizierung nicht verfügbar ist.
        </p>
      </div>
      <OrderManagement />
    </div>
  );
}
