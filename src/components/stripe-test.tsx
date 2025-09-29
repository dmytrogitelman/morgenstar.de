'use client';

import { useState } from 'react';

export default function StripeTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTestStripe = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-stripe');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Network error',
        details: 'Failed to connect to test endpoint',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status.includes('✅')) return '✅';
    if (status.includes('❌')) return '❌';
    return '⚠️';
  };

  const getStatusColor = (status: string) => {
    if (status.includes('✅')) return 'text-green-600';
    if (status.includes('❌')) return 'text-red-600';
    return 'text-yellow-600';
  };

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">💳 Stripe-Zahlungssystem Test</h3>
      
      <button
        onClick={handleTestStripe}
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
      >
        {isLoading ? 'Teste Stripe...' : 'Stripe-Integration testen'}
      </button>

      {result && (
        <div className={`p-4 rounded-md border ${
          result.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center mb-2">
            <span className="font-semibold">
              {result.success ? '✅' : '❌'} {result.message || result.error}
            </span>
          </div>
          
          {result.tests && (
            <div className="mt-3">
              <h4 className="font-medium mb-2">Test-Ergebnisse:</h4>
              <div className="space-y-1 text-sm">
                {Object.entries(result.tests).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className={`font-medium ${getStatusColor(value as string)}`}>
                      {getStatusIcon(value as string)} {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.details && (
            <div className="mt-3">
              <h4 className="font-medium mb-1">Details:</h4>
              <p className="text-sm text-gray-600">{result.details}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Hinweis:</strong> Stellen Sie sicher, dass die Stripe-Konfiguration in der .env-Datei korrekt ist:</p>
        <ul className="mt-2 space-y-1">
          <li>• STRIPE_SECRET_KEY (sk_test_...)</li>
          <li>• NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_test_...)</li>
          <li>• STRIPE_WEBHOOK_SECRET (whsec_...)</li>
        </ul>
      </div>
    </div>
  );
}

