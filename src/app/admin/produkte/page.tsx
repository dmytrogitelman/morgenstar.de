// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
// import { redirect } from 'next/navigation';
import ProductManagement from './product-management';

export default async function AdminProductsPage() {
  // const session = await getServerSession(authOptions);
  
  // if (!session?.user?.id) {
  //   redirect('/anmelden?callbackUrl=/admin/produkte');
  // }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Produktverwaltung</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Neues Produkt
        </button>
      </div>
      <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 mb-6">
        <p className="text-yellow-800">
          <strong>Hinweis:</strong> Admin-Funktionen sind temporär deaktiviert, da die Authentifizierung nicht verfügbar ist.
        </p>
      </div>
      <ProductManagement />
    </div>
  );
}
