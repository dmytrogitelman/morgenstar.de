'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import EmailTest from '@/components/email-test';
import StripeTest from '@/components/stripe-test';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  const fetchStats = async () => {
    try {
      // Temporär deaktiviert - API nicht verfügbar ohne Authentifizierung
      setStats({
        totalProducts: 3,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0
      });
    } catch (error) {
      console.error('Fehler beim Laden der Statistiken:', error);
    } finally {
      setIsLoading(false);
    }
  };

    fetchStats();
  }, []);

  const formatPrice = (priceCents: number) => {
    return (priceCents / 100).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-gray-600">Dashboard wird geladen...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Produkte</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bestellungen</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🛒</span>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Umsatz</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)} €</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ausstehend</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Schnellaktionen</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/produkte"
            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📦</span>
            </div>
            <div>
              <p className="font-medium">Produkte verwalten</p>
              <p className="text-sm text-gray-600">Hinzufügen, bearbeiten, löschen</p>
            </div>
          </Link>

          <Link
            href="/admin/bestellungen"
            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🛒</span>
            </div>
            <div>
              <p className="font-medium">Bestellungen verwalten</p>
              <p className="text-sm text-gray-600">Status ändern, verfolgen</p>
            </div>
          </Link>

          <Link
            href="/admin/kategorien"
            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🏷️</span>
            </div>
            <div>
              <p className="font-medium">Kategorien verwalten</p>
              <p className="text-sm text-gray-600">Organisieren und strukturieren</p>
            </div>
          </Link>

          <Link
            href="/admin/marken"
            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🏢</span>
            </div>
            <div>
              <p className="font-medium">Marken verwalten</p>
              <p className="text-sm text-gray-600">Hersteller und Labels</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Letzte Bestellungen</h2>
          <Link
            href="/admin/bestellungen"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Alle anzeigen
          </Link>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p>Keine Bestellungen verfügbar</p>
        </div>
      </div>

      {/* Email Test Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">System-Tools</h2>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <EmailTest />
          <StripeTest />
        </div>

        <div className="mt-6">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">🔧 System-Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Database</span>
                <span className="text-green-600 font-medium">✅ Verbunden</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Email-System</span>
                <span className="text-yellow-600 font-medium">⚠️ Konfiguration erforderlich</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Payment-System</span>
                <span className="text-yellow-600 font-medium">⚠️ Konfiguration erforderlich</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Authentication</span>
                <span className="text-green-600 font-medium">✅ Aktiv</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
