import { productQueries } from '@/lib/queries';
import ProductCard from '@/components/product-card';
import NewsletterSignup from '@/components/newsletter-signup';
import LazySection from '@/components/lazy-section';
import Link from 'next/link';

export default async function Home() {
  const products = await productQueries.getFeaturedProducts(6);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            ☕ Morgenstar
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
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
              className="border-2 border-amber-600 text-amber-600 dark:text-amber-400 px-8 py-3 rounded-lg font-semibold hover:bg-amber-600 hover:text-white transition-colors"
            >
              Warenkorb ansehen
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <LazySection 
        className="py-16 bg-white dark:bg-gray-900"
        fallback={
          <div className="py-16 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-6">
              <div className="text-center mb-12">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4 mx-auto w-80"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto w-96"></div>
              </div>
              <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 animate-pulse">
                    <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Unsere beliebtesten Kaffeesorten
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
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
              className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              Alle Kaffeesorten ansehen
            </Link>
          </div>
        </div>
      </LazySection>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
            <div className="text-center">
              <div className="bg-amber-100 dark:bg-amber-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Schnelle Lieferung</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Kostenlose Lieferung ab 50€. Frisch geröstet und direkt zu Ihnen nach Hause.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-amber-100 dark:bg-amber-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Premium Qualität</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Nur die besten Kaffeesorten von zertifizierten Röstereien weltweit.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-amber-100 dark:bg-amber-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">30 Tage Garantie</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Nicht zufrieden? Geld-zurück-Garantie innerhalb von 30 Tagen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <LazySection className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <NewsletterSignup />
        </div>
      </LazySection>
    </div>
  );
}

