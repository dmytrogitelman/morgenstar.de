import { productQueries } from '@/lib/queries';
import ProductCard from '@/components/product-card';
import Breadcrumbs from '@/components/breadcrumbs';

export default async function Page() {
  const products = await productQueries.getProductsForListing();

  return (
    <div className="container mx-auto px-6 py-8">
      <Breadcrumbs items={[{ label: 'Kaffee' }]} />
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ☕ Unsere Kaffeesorten
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Entdecken Sie unsere handverlesene Auswahl an Premium-Kaffeesorten aus den besten Anbaugebieten der Welt. 
          Jeder Kaffee wird sorgfältig ausgewählt und schonend geröstet.
        </p>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
            {products.length} Produkte
          </span>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Kostenlose Lieferung ab 50€
          </span>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            Frisch geröstet
          </span>
        </div>
      </div>

      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">☕</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Keine Kaffeesorten gefunden
          </h3>
          <p className="text-gray-600">
            Wir arbeiten daran, neue Sorten hinzuzufügen. Schauen Sie bald wieder vorbei!
          </p>
        </div>
      )}
    </div>
  );
}

