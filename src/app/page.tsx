import { productQueries } from '@/lib/queries';
import ProductCard from '@/components/product-card';
import Link from 'next/link';

export default async function Home() {
  const products = await productQueries.getFeaturedProducts(6);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amber-50 to-orange-50 py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            ☕ Morgenstar
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Entdecken Sie die Welt des Kaffees mit unseren premium Kaffeesorten aus aller Welt. 
            Jede Tasse erzählt eine Geschichte.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/kaffee" 
              className="bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
            >
              Kaffee entdecken
            </Link>
            <Link 
              href="/warenkorb" 
              className="border-2 border-amber-600 text-amber-600 px-8 py-3 rounded-lg font-semibold hover:bg-amber-600 hover:text-white transition-colors"
            >
              Warenkorb ansehen
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Unsere beliebtesten Kaffeesorten
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Handverlesene Kaffeesorten von den besten Röstereien der Welt
            </p>
          </div>
          
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/kaffee" 
              className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Alle Kaffeesorten ansehen
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
            <div className="text-center">
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Schnelle Lieferung</h3>
              <p className="text-gray-600">
                Kostenlose Lieferung ab 50€. Frisch geröstet und direkt zu Ihnen nach Hause.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Qualität</h3>
              <p className="text-gray-600">
                Nur die besten Kaffeesorten von zertifizierten Röstereien weltweit.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">30 Tage Garantie</h3>
              <p className="text-gray-600">
                Nicht zufrieden? Geld-zurück-Garantie innerhalb von 30 Tagen.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

