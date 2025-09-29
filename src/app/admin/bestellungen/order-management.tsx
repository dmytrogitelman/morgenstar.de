'use client';

import { useState, useEffect } from 'react';

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
      brand?: {
        name: string;
      };
    };
  };
}

interface User {
  id: string;
  name?: string;
  email: string;
}

interface Order {
  id: string;
  status: string;
  totalCents: number;
  currency: string;
  createdAt: string;
  user: User;
  items: OrderItem[];
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Temporär deaktiviert - API nicht verfügbar ohne Authentifizierung
        setOrders([]);
      } catch (error) {
        console.error('Fehler beim Laden der Bestellungen:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string, trackingNumber?: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          trackingNumber
        }),
      });

      if (response.ok) {
        // Update local state
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        ));
        setSelectedOrder(null);
      } else {
        alert('Fehler beim Aktualisieren des Bestellstatus');
      }
    } catch (error) {
      alert('Fehler beim Aktualisieren des Bestellstatus');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatPrice = (priceCents: number) => {
    return (priceCents / 100).toFixed(2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-gray-600">Bestellungen werden geladen...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Orders Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bestellung
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kunde
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Betrag
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      #{order.id.slice(-8)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.items.length} Artikel
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.user.name || 'Unbekannt'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(order.totalCents)} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Verwalten
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Keine Bestellungen gefunden</h3>
            <p className="text-gray-500">Es wurden noch keine Bestellungen aufgegeben.</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Bestellung #{selectedOrder.id.slice(-8)}</h2>
                  <p className="text-gray-600">Bestellt am {formatDate(selectedOrder.createdAt)}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Bestellte Artikel</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{item.variant.product.title}</div>
                          <div className="text-sm text-gray-600">
                            {item.variant.name} • {item.qty}x
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {formatPrice(item.priceCents)} €
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Gesamt:</span>
                      <span>{formatPrice(selectedOrder.totalCents)} €</span>
                    </div>
                  </div>
                </div>

                {/* Status Management */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Status verwalten</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Neuer Status
                      </label>
                      <select
                        id="status-select"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        defaultValue={selectedOrder.status}
                      >
                        <option value="PENDING">Wartend</option>
                        <option value="CONFIRMED">Bestätigt</option>
                        <option value="SHIPPED">Versendet</option>
                        <option value="DELIVERED">Geliefert</option>
                        <option value="CANCELLED">Storniert</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tracking-Nummer (optional)
                      </label>
                      <input
                        type="text"
                        placeholder="z.B. 1Z999AA1234567890"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const statusSelect = document.getElementById('status-select') as HTMLSelectElement;
                        const trackingInput = document.querySelector('input[type="text"]') as HTMLInputElement;
                        updateOrderStatus(
                          selectedOrder.id,
                          statusSelect.value,
                          trackingInput.value || undefined
                        );
                      }}
                      disabled={isUpdating}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? 'Wird aktualisiert...' : 'Status aktualisieren'}
                    </button>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Kundeninformationen</h4>
                    <div className="text-sm text-blue-800">
                      <p><strong>Name:</strong> {selectedOrder.user.name || 'Nicht angegeben'}</p>
                      <p><strong>E-Mail:</strong> {selectedOrder.user.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
