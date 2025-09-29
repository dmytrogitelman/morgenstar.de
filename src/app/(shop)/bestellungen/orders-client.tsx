'use client';

import { useState, useEffect } from 'react';
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

export default function OrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Bestellungen:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatPrice = (priceCents: number) => {
    return (priceCents / 100).toFixed(2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-gray-600">Bestellungen werden geladen...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📦</div>
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">Keine Bestellungen gefunden</h2>
        <p className="text-gray-500 mb-6">Sie haben noch keine Bestellungen aufgegeben.</p>
        <Link 
          href="/kaffee"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Jetzt einkaufen
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div key={order.id} className="bg-white border rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">Bestellung #{order.id.slice(-8)}</h3>
              <p className="text-gray-600">Bestellt am {formatDate(order.createdAt)}</p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
              <p className="text-xl font-bold text-green-600 mt-2">
                {formatPrice(order.totalCents)} €
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Bestellte Artikel ({order.items.length})</h4>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">☕</span>
                    </div>
                    <div>
                      <p className="font-medium">{item.variant.product.title}</p>
                      <p className="text-sm text-gray-600">
                        {item.variant.name} • {item.qty}x
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold">
                    {formatPrice(item.priceCents * item.qty)} €
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 mt-4 flex justify-between items-center">
            <Link
              href={`/bestellung-erfolgreich/${order.id}`}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Bestelldetails anzeigen
            </Link>
            {order.status === 'DELIVERED' && (
              <button className="text-green-600 hover:text-green-800 font-medium">
                Erneut bestellen
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}


