'use client';

import { useState } from 'react';

interface CouponFormProps {
  onCouponApplied: (coupon: any, discountAmount: number) => void;
  onCouponRemoved: () => void;
  orderValue: number;
  appliedCoupon?: any;
}

export default function CouponForm({ 
  onCouponApplied, 
  onCouponRemoved, 
  orderValue,
  appliedCoupon 
}: CouponFormProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateCoupon = async () => {
    if (!code.trim()) {
      setError('Bitte geben Sie einen Gutscheincode ein');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.trim(),
          orderValue: orderValue,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onCouponApplied(data.coupon, data.discountAmount);
        setCode('');
      } else {
        setError(data.error || 'Fehler beim Validieren des Gutscheincodes');
      }
    } catch (error) {
      setError('Ein Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  const removeCoupon = () => {
    onCouponRemoved();
    setError('');
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
        🎁 Gutscheincode
      </h3>
      
      {appliedCoupon ? (
        <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <div>
            <p className="text-green-800 dark:text-green-200 font-medium">
              ✓ {appliedCoupon.code} angewendet
            </p>
            {appliedCoupon.description && (
              <p className="text-green-600 dark:text-green-300 text-sm">
                {appliedCoupon.description}
              </p>
            )}
          </div>
          <button
            onClick={removeCoupon}
            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 font-medium"
          >
            Entfernen
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Gutscheincode eingeben"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              onKeyPress={(e) => e.key === 'Enter' && validateCoupon()}
            />
            <button
              onClick={validateCoupon}
              disabled={isLoading || !code.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '...' : 'Einlösen'}
            </button>
          </div>
          
          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
