'use client';

import { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StripePayment from '@/components/stripe-payment';

interface CartItem {
  id: string;
  qty: number;
  variant: {
    id: string;
    name: string;
    priceCents: number;
    currency: string;
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

interface CartData {
  items: CartItem[];
  total: number;
  itemCount: number;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  street: string;
  houseNumber: string;
  city: string;
  postalCode: string;
  country: string;
}

interface BillingAddress extends ShippingAddress {}

export default function CheckoutClient() {
  // const { data: session, status } = useSession();
  const session = null; // Temporär deaktiviert
  const status = 'unauthenticated'; // Temporär deaktiviert
  const router = useRouter();
  
  const [cartData, setCartData] = useState<CartData>({ items: [], total: 0, itemCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    company: '',
    street: '',
    houseNumber: '',
    city: '',
    postalCode: '',
    country: 'Deutschland'
  });
  
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    firstName: '',
    lastName: '',
    company: '',
    street: '',
    houseNumber: '',
    city: '',
    postalCode: '',
    country: 'Deutschland'
  });
  
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        setCartData(data);
      }
    } catch (error) {
      console.error('Fehler beim Laden des Warenkorbs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/anmelden?callbackUrl=/kasse');
    }
  }, [status, router]);

  useEffect(() => {
    if (useSameAddress) {
      setBillingAddress(shippingAddress);
    }
  }, [shippingAddress, useSameAddress]);

  const handleAddressChange = (address: 'shipping' | 'billing', field: string, value: string) => {
    if (address === 'shipping') {
      setShippingAddress(prev => ({ ...prev, [field]: value }));
    } else {
      setBillingAddress(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartData.items,
          shippingAddress,
          billingAddress: useSameAddress ? shippingAddress : billingAddress,
          paymentMethod,
          total: cartData.total
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setOrderId(data.orderId);
        
        if (paymentMethod === 'credit-card') {
          setShowPayment(true);
        } else {
          // For other payment methods, redirect immediately
          await fetch('/api/cart', { method: 'DELETE' });
          router.push(`/bestellung-erfolgreich/${data.orderId}`);
        }
      } else {
        alert(data.error || 'Fehler bei der Bestellabwicklung');
      }
    } catch (error) {
      alert('Ein Fehler ist aufgetreten');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async () => {
    // Clear cart
    await fetch('/api/cart', { method: 'DELETE' });
    
    // Redirect to success page
    if (orderId) {
      router.push(`/bestellung-erfolgreich/${orderId}`);
    }
  };

  const handlePaymentError = (error: string) => {
    alert(`Zahlungsfehler: ${error}`);
  };

  const formatPrice = (priceCents: number) => {
    return (priceCents / 100).toFixed(2);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-gray-600">Wird geladen...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">Anmeldung erforderlich</h2>
        <p className="text-gray-500 mb-6">Sie müssen angemeldet sein, um eine Bestellung aufzugeben.</p>
        <Link 
          href="/anmelden?callbackUrl=/kasse"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Jetzt anmelden
        </Link>
      </div>
    );
  }

  if (cartData.items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">Warenkorb ist leer</h2>
        <p className="text-gray-500 mb-6">Fügen Sie Artikel zu Ihrem Warenkorb hinzu, um fortzufahren.</p>
        <Link 
          href="/kaffee"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Kaffee entdecken
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Checkout Form */}
      <div className="space-y-8">
        {/* Lieferadresse */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Lieferadresse</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vorname *</label>
              <input
                type="text"
                required
                value={shippingAddress.firstName}
                onChange={(e) => handleAddressChange('shipping', 'firstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nachname *</label>
              <input
                type="text"
                required
                value={shippingAddress.lastName}
                onChange={(e) => handleAddressChange('shipping', 'lastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Firma (optional)</label>
              <input
                type="text"
                value={shippingAddress.company}
                onChange={(e) => handleAddressChange('shipping', 'company', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Straße *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={shippingAddress.street}
                  onChange={(e) => handleAddressChange('shipping', 'street', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Straßenname"
                />
                <input
                  type="text"
                  required
                  value={shippingAddress.houseNumber}
                  onChange={(e) => handleAddressChange('shipping', 'houseNumber', e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nr."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PLZ *</label>
              <input
                type="text"
                required
                value={shippingAddress.postalCode}
                onChange={(e) => handleAddressChange('shipping', 'postalCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stadt *</label>
              <input
                type="text"
                required
                value={shippingAddress.city}
                onChange={(e) => handleAddressChange('shipping', 'city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Land *</label>
              <select
                required
                value={shippingAddress.country}
                onChange={(e) => handleAddressChange('shipping', 'country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Deutschland">Deutschland</option>
                <option value="Österreich">Österreich</option>
                <option value="Schweiz">Schweiz</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rechnungsadresse */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Rechnungsadresse</h2>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={useSameAddress}
                onChange={(e) => setUseSameAddress(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Gleich wie Lieferadresse</span>
            </label>
          </div>
          
          {!useSameAddress && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vorname *</label>
                <input
                  type="text"
                  required
                  value={billingAddress.firstName}
                  onChange={(e) => handleAddressChange('billing', 'firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nachname *</label>
                <input
                  type="text"
                  required
                  value={billingAddress.lastName}
                  onChange={(e) => handleAddressChange('billing', 'lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Firma (optional)</label>
                <input
                  type="text"
                  value={billingAddress.company}
                  onChange={(e) => handleAddressChange('billing', 'company', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Straße *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={billingAddress.street}
                    onChange={(e) => handleAddressChange('billing', 'street', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Straßenname"
                  />
                  <input
                    type="text"
                    required
                    value={billingAddress.houseNumber}
                    onChange={(e) => handleAddressChange('billing', 'houseNumber', e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nr."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PLZ *</label>
                <input
                  type="text"
                  required
                  value={billingAddress.postalCode}
                  onChange={(e) => handleAddressChange('billing', 'postalCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stadt *</label>
                <input
                  type="text"
                  required
                  value={billingAddress.city}
                  onChange={(e) => handleAddressChange('billing', 'city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Land *</label>
                <select
                  required
                  value={billingAddress.country}
                  onChange={(e) => handleAddressChange('billing', 'country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Deutschland">Deutschland</option>
                  <option value="Österreich">Österreich</option>
                  <option value="Schweiz">Schweiz</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Zahlungsmethode */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Zahlungsmethode</h2>
          <div className="space-y-3">
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="payment"
                value="credit-card"
                checked={paymentMethod === 'credit-card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3"
              />
              <div>
                <div className="font-medium">Kreditkarte</div>
                <div className="text-sm text-gray-600">Visa, Mastercard, American Express</div>
              </div>
            </label>
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="payment"
                value="paypal"
                checked={paymentMethod === 'paypal'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3"
              />
              <div>
                <div className="font-medium">PayPal</div>
                <div className="text-sm text-gray-600">Sicher und schnell bezahlen</div>
              </div>
            </label>
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="payment"
                value="bank-transfer"
                checked={paymentMethod === 'bank-transfer'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3"
              />
              <div>
                <div className="font-medium">Überweisung</div>
                <div className="text-sm text-gray-600">Vorkasse per Banküberweisung</div>
              </div>
            </label>
          </div>
        </div>

        {/* AGB */}
        <div className="bg-white border rounded-lg p-6">
          <label className="flex items-start">
            <input
              type="checkbox"
              required
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mr-3 mt-1"
            />
            <span className="text-sm text-gray-700">
              Ich habe die{' '}
              <Link href="/agb" className="text-blue-600 hover:text-blue-800">
                Allgemeinen Geschäftsbedingungen
              </Link>{' '}
              und die{' '}
              <Link href="/datenschutz" className="text-blue-600 hover:text-blue-800">
                Datenschutzerklärung
              </Link>{' '}
              gelesen und akzeptiere sie. *
            </span>
          </label>
        </div>
      </div>

      {/* Bestellübersicht */}
      <div className="lg:col-span-1">
        <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
          <h3 className="text-xl font-semibold mb-4">Bestellübersicht</h3>
          
          <div className="space-y-4 mb-6">
            {cartData.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium">{item.variant.product.title}</div>
                  <div className="text-sm text-gray-600">{item.variant.name}</div>
                  <div className="text-sm text-gray-600">Menge: {item.qty}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {formatPrice(item.variant.priceCents * item.qty)} €
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span>Zwischensumme</span>
              <span>{formatPrice(cartData.total)} €</span>
            </div>
            <div className="flex justify-between">
              <span>Versand</span>
              <span className="text-green-600">Kostenlos</span>
            </div>
            <hr />
            <div className="flex justify-between text-lg font-semibold">
              <span>Gesamt</span>
              <span>{formatPrice(cartData.total)} €</span>
            </div>
          </div>

          {!showPayment ? (
            <button
              type="submit"
              disabled={isProcessing || !acceptTerms}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Wird verarbeitet...' : 'Bestellung abschließen'}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Zahlung mit Kreditkarte</h3>
                <p className="text-sm text-blue-800">
                  Ihre Bestellung wurde erstellt. Bitte vervollständigen Sie die Zahlung.
                </p>
              </div>
              
              {orderId && (
                <StripePayment
                  amount={cartData.total}
                  orderId={orderId}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              )}
              
              <button
                onClick={() => setShowPayment(false)}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700"
              >
                Zurück zur Bestellung
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
