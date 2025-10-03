'use client';

import { useState } from 'react';
import { trackEvent, trackNewsletterSignup, trackSearch } from '@/lib/analytics';

export default function ComprehensiveTest() {
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    setIsLoading(prev => ({ ...prev, [testName]: true }));
    
    try {
      const result = await testFunction();
      setTestResults(prev => ({
        ...prev,
        [testName]: { status: 'success', data: result }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: { status: 'error', error: error instanceof Error ? error.message : String(error) }
      }));
    } finally {
      setIsLoading(prev => ({ ...prev, [testName]: false }));
    }
  };

  // API Tests
  const testWishlistAPI = async () => {
    const response = await fetch('/api/wishlist');
    return { status: response.status, ok: response.ok };
  };

  const testCouponAPI = async () => {
    const response = await fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'TEST', orderValue: 5000 })
    });
    return { status: response.status, ok: response.ok };
  };

  const testNewsletterAPI = async () => {
    const response = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' })
    });
    return { status: response.status, ok: response.ok };
  };

  const testCartAPI = async () => {
    const response = await fetch('/api/cart');
    return { status: response.status, ok: response.ok };
  };

  // UI Tests
  const testThemeToggle = async () => {
    const themeToggle = document.querySelector('[aria-label="Theme wechseln"]');
    return { exists: themeToggle !== null, element: themeToggle?.tagName };
  };

  const testDarkMode = async () => {
    const root = document.documentElement;
    const hasDarkClasses = root.classList.contains('dark') || root.classList.contains('light');
    const currentTheme = root.classList.contains('dark') ? 'dark' : 'light';
    return { hasClasses: hasDarkClasses, currentTheme };
  };

  const testAnalytics = async () => {
    try {
      trackEvent('test_event', 'feature_test');
      trackNewsletterSignup();
      trackSearch('test search');
      return { success: true, message: 'Analytics events tracked' };
    } catch (error) {
      throw error;
    }
  };

  const testLocalStorage = async () => {
    try {
      const testKey = 'morgenstar-test';
      const testValue = 'test-value';
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      return { success: retrieved === testValue, value: retrieved };
    } catch (error) {
      throw error;
    }
  };

  // Performance Tests
  const testPerformance = async () => {
    const start = performance.now();
    
    // Simulate some work
    for (let i = 0; i < 1000000; i++) {
      Math.random();
    }
    
    const end = performance.now();
    const duration = end - start;
    
    return { duration: Math.round(duration), performance: duration < 100 ? 'good' : 'slow' };
  };

  const testResponsiveDesign = async () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;
    
    return { width, height, deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop' };
  };

  // Run all tests
  const runAllTests = async () => {
    const tests = [
      { name: 'wishlist', fn: testWishlistAPI },
      { name: 'coupon', fn: testCouponAPI },
      { name: 'newsletter', fn: testNewsletterAPI },
      { name: 'cart', fn: testCartAPI },
      { name: 'themeToggle', fn: testThemeToggle },
      { name: 'darkMode', fn: testDarkMode },
      { name: 'analytics', fn: testAnalytics },
      { name: 'localStorage', fn: testLocalStorage },
      { name: 'performance', fn: testPerformance },
      { name: 'responsive', fn: testResponsiveDesign },
    ];

    for (const test of tests) {
      await runTest(test.name, test.fn);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 dark:text-green-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          🧪 Comprehensive Feature Test
        </h2>
        <button
          onClick={runAllTests}
          disabled={Object.values(isLoading).some(loading => loading)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {Object.values(isLoading).some(loading => loading) ? 'Testing...' : 'Run All Tests'}
        </button>
      </div>
      
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* API Tests */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            API Endpoints
          </h3>
          
          {['wishlist', 'coupon', 'newsletter', 'cart'].map((testName) => (
            <div key={testName} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300 capitalize">{testName} API</span>
              <div className="flex items-center gap-2">
                {isLoading[testName] && <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>}
                <span className={`text-sm ${getStatusColor(testResults[testName]?.status || 'pending')}`}>
                  {testResults[testName]?.status ? getStatusIcon(testResults[testName].status) : '⏳'} 
                  {testResults[testName]?.status === 'success' && testResults[testName]?.data?.status && 
                    ` ${testResults[testName].data.status}`
                  }
                </span>
                <button
                  onClick={() => runTest(testName, eval(`test${testName.charAt(0).toUpperCase() + testName.slice(1)}API`))}
                  disabled={isLoading[testName]}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  Test
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* UI Tests */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            UI Features
          </h3>
          
          {['themeToggle', 'darkMode', 'analytics', 'localStorage', 'performance', 'responsive'].map((testName) => (
            <div key={testName} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300 capitalize">
                {testName.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <div className="flex items-center gap-2">
                {isLoading[testName] && <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>}
                <span className={`text-sm ${getStatusColor(testResults[testName]?.status || 'pending')}`}>
                  {testResults[testName]?.status ? getStatusIcon(testResults[testName].status) : '⏳'}
                  {testResults[testName]?.data?.deviceType && ` ${testResults[testName].data.deviceType}`}
                  {testResults[testName]?.data?.duration && ` ${testResults[testName].data.duration}ms`}
                </span>
                <button
                  onClick={() => runTest(testName, eval(`test${testName.charAt(0).toUpperCase() + testName.slice(1)}`))}
                  disabled={isLoading[testName]}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  Test
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Results */}
      {Object.keys(testResults).length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            📊 Detailed Results
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {Object.entries(testResults).map(([testName, result]) => (
              <div key={testName} className="text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {testName}:
                </span>
                <span className={`ml-2 ${getStatusColor(result.status)}`}>
                  {result.status === 'success' 
                    ? JSON.stringify(result.data)
                    : result.error
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
          📊 Test Summary
        </h4>
        <p className="text-sm text-blue-800 dark:text-blue-300">
          {Object.keys(testResults).length === 0 
            ? 'No tests run yet. Click "Run All Tests" to start comprehensive testing.'
            : `${Object.values(testResults).filter(r => r.status === 'success').length} of ${Object.keys(testResults).length} tests passed`
          }
        </p>
      </div>
    </div>
  );
}
