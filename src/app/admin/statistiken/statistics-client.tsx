'use client';

import { useState } from 'react';

interface StatisticsProps {
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    totalUsers: number;
    ordersByStatus: { status: string; _count: { status: number } }[];
    revenueByMonth: { month: string; revenue: number }[];
    topProducts: any[];
    recentOrders: any[];
  };
}

export default function StatisticsClient({ stats }: StatisticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('12months');

  const formatPrice = (priceCents: number) => {
    return (priceCents / 100).toLocaleString('de-DE', {
      style: 'currency',
      currency: 'EUR',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">☕</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Produkte</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">📦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bestellungen</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Umsatz</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Benutzer</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Status Distribution */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Bestellstatus</h3>
          <div className="space-y-3">
            {stats.ordersByStatus.map((status) => (
              <div key={status.status} className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status.status)}`}>
                  {status.status}
                </span>
                <span className="font-semibold">{status._count.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Beliebteste Produkte</h3>
          <div className="space-y-3">
            {stats.topProducts.slice(0, 5).map((product, index) => (
              <div key={product.variantId} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-lg font-bold text-gray-400 mr-3">#{index + 1}</span>
                  <div>
                    <p className="font-medium">{product.product?.title}</p>
                    <p className="text-sm text-gray-600">{product.variant?.name}</p>
                  </div>
                </div>
                <span className="font-semibold">{product._sum.qty} verkauft</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Umsatzverlauf</h3>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-1 border rounded-lg text-sm"
          >
            <option value="12months">Letzte 12 Monate</option>
            <option value="6months">Letzte 6 Monate</option>
            <option value="3months">Letzte 3 Monate</option>
          </select>
        </div>
        
        <div className="h-64 flex items-end justify-between space-x-2">
          {stats.revenueByMonth.slice(0, 12).map((month, index) => {
            const maxRevenue = Math.max(...stats.revenueByMonth.map(m => m.revenue));
            const height = (month.revenue / maxRevenue) * 200;
            
            return (
              <div key={month.month} className="flex flex-col items-center">
                <div
                  className="bg-blue-500 rounded-t w-8 mb-2"
                  style={{ height: `${height}px` }}
                  title={`${month.month}: ${formatPrice(month.revenue)}`}
                />
                <span className="text-xs text-gray-600 transform -rotate-45 origin-left">
                  {new Date(month.month + '-01').toLocaleDateString('de-DE', { month: 'short' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Neueste Bestellungen</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id.slice(-8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.user?.name || order.user?.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(order.totalCents)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString('de-DE')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

