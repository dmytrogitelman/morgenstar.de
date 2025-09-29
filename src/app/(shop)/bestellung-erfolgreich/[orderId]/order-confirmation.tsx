import Link from 'next/link';

interface OrderItem {
  id: string;
  qty: number;
  priceCents: number;
  variant: {
    id: string;
    name: string;
    product: {
      id: string;
      title: string;
      slug: string;
      brand?: {
        name: string;
      };
    };
  };
}

interface Order {
  id: string;
  status: string;
  totalCents: number;
  currency: string;
  createdAt: string;
  items: OrderItem[];
}

interface OrderConfirmationProps {
  order: Order;
}

export default function OrderConfirmation({ order }: OrderConfirmationProps) {
  const formatPrice = (priceCents: number) => {
    return (priceCents / 100).toFixed(2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Wartend';
      case 'CONFIRMED':
        return 'Bestätigt';
      case 'SHIPPED':
        return 'Versendet';
      case 'DELIVERED':
        return 'Geliefert';
      case 'CANCELLED':
        return 'Storniert';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'CONFIRMED':
        return 'text-blue-600 bg-blue-100';
      case 'SHIPPED':
        return 'text-purple-600 bg-purple-100';
      case 'DELIVERED':
        return 'text-green-600 bg-green-100';
      case 'CANCELLED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-green-600 mb-2">Bestellung erfolgreich!</h1>
        <p className="text-gray-600">
          Vielen Dank für Ihre Bestellung. Sie erhalten in Kürze eine Bestätigungs-E-Mail.
        </p>
      </div>

      {/* Order Details */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Bestelldetails</h2>
            <p className="text-gray-600">Bestellnummer: <span className="font-mono">{order.id}</span></p>
            <p className="text-gray-600">Bestelldatum: {formatDate(order.createdAt)}</p>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {formatPrice(order.totalCents)} €
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Bestellte Artikel</h3>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">☕</span>
                  </div>
                  <div>
                    <h4 className="font-medium">{item.variant.product.title}</h4>
                    {item.variant.product.brand && (
                      <p className="text-sm text-gray-600">{item.variant.product.brand.name}</p>
                    )}
                    <p className="text-sm text-gray-600">{item.variant.name}</p>
                    <p className="text-sm text-gray-600">Menge: {item.qty}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(item.priceCents * item.qty)} €</p>
                  <p className="text-sm text-gray-600">{formatPrice(item.priceCents)} € pro Stück</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Was passiert als nächstes?</h3>
        <div className="space-y-2 text-blue-800">
          <p>• Sie erhalten eine Bestätigungs-E-Mail mit allen Details</p>
          <p>• Wir bereiten Ihre Bestellung vor (1-2 Werktage)</p>
          <p>• Sie erhalten eine Versandbestätigung mit Tracking-Informationen</p>
          <p>• Ihre Bestellung wird innerhalb von 2-3 Werktagen geliefert</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/bestellungen"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 text-center transition-colors"
        >
          Meine Bestellungen anzeigen
        </Link>
        <Link
          href="/kaffee"
          className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 text-center transition-colors"
        >
          Weiter einkaufen
        </Link>
      </div>
    </div>
  );
}


