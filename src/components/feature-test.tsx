'use client';

import { useState } from 'react';
import { trackEvent, trackNewsletterSignup } from '@/lib/analytics';

export default function FeatureTest() {
  const [testResults, setTestResults] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  const runTest = async (testName: string, testFunction: () => Promise<boolean>) => {
    setIsLoading(prev => ({ ...prev, [testName]: true }));
    
    try {
      const result = await testFunction();
      setTestResults(prev => ({
        ...prev,
        [testName]: result ? '✅ Erfolgreich' : '❌ Fehlgeschlagen'
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: `❌ Fehler: ${error}`
      }));
    } finally {
      setIsLoading(prev => ({ ...prev, [testName]: false }));
    }
  };

  const testWishlistAPI = async () => {
    const response = await fetch('/api/wishlist');
    return response.ok;
  };

  const testCouponAPI = async () => {
    const response = await fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'TEST', orderValue: 5000 })
    });
    // Should fail with invalid code, but API should respond
    return response.status === 400 || response.status === 404;
  };

  const testNewsletterAPI = async () => {
    const response = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' })
    });
    return response.ok;
  };

  const testAnalytics = async () => {
    try {
      trackEvent('test_event', 'feature_test');
      trackNewsletterSignup();
      return true;
    } catch (error) {
      return false;
    }
  };

  const testThemeToggle = async () => {
    // Check if theme toggle is available
    const themeToggle = document.querySelector('[aria-label="Theme wechseln"]');
    return themeToggle !== null;
  };

  const testDarkMode = async () => {
    // Check if dark mode classes are available
    const hasDarkClasses = document.documentElement.classList.contains('dark') || 
                          document.documentElement.classList.contains('light');
    return hasDarkClasses;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        🧪 Feature-Test Dashboard
      </h2>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {/* API Tests */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            API-Endpoints
          </h3>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300">Wunschliste API</span>
            <div className="flex items-center gap-2">
              {isLoading.wishlist && <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>}
              <span className="text-sm">{testResults.wishlist || 'Nicht getestet'}</span>
              <button
                onClick={() => runTest('wishlist', testWishlistAPI)}
                disabled={isLoading.wishlist}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Testen
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300">Rabattcode API</span>
            <div className="flex items-center gap-2">
              {isLoading.coupon && <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>}
              <span className="text-sm">{testResults.coupon || 'Nicht getestet'}</span>
              <button
                onClick={() => runTest('coupon', testCouponAPI)}
                disabled={isLoading.coupon}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Testen
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300">Newsletter API</span>
            <div className="flex items-center gap-2">
              {isLoading.newsletter && <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>}
              <span className="text-sm">{testResults.newsletter || 'Nicht getestet'}</span>
              <button
                onClick={() => runTest('newsletter', testNewsletterAPI)}
                disabled={isLoading.newsletter}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Testen
              </button>
            </div>
          </div>
        </div>

        {/* UI Tests */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            UI-Features
          </h3>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300">Analytics</span>
            <div className="flex items-center gap-2">
              {isLoading.analytics && <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>}
              <span className="text-sm">{testResults.analytics || 'Nicht getestet'}</span>
              <button
                onClick={() => runTest('analytics', testAnalytics)}
                disabled={isLoading.analytics}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Testen
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300">Theme Toggle</span>
            <div className="flex items-center gap-2">
              {isLoading.themeToggle && <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>}
              <span className="text-sm">{testResults.themeToggle || 'Nicht getestet'}</span>
              <button
                onClick={() => runTest('themeToggle', testThemeToggle)}
                disabled={isLoading.themeToggle}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Testen
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
            <div className="flex items-center gap-2">
              {isLoading.darkMode && <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>}
              <span className="text-sm">{testResults.darkMode || 'Nicht getestet'}</span>
              <button
                onClick={() => runTest('darkMode', testDarkMode)}
                disabled={isLoading.darkMode}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Testen
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
          📊 Test-Status
        </h4>
        <p className="text-sm text-blue-800 dark:text-blue-300">
          {Object.keys(testResults).length === 0 
            ? 'Führen Sie Tests durch, um den Status der Features zu überprüfen.'
            : `${Object.values(testResults).filter(r => r.includes('✅')).length} von ${Object.keys(testResults).length} Tests erfolgreich`
          }
        </p>
      </div>
    </div>
  );
}
