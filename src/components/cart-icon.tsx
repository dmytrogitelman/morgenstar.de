'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CartData {
  itemCount: number;
}

export default function CartIcon() {
  const [cartData, setCartData] = useState<CartData>({ itemCount: 0 });

  const fetchCartCount = async () => {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        setCartData(data);
      }
    } catch (error) {
      // Ignore errors for cart count
    }
  };

  useEffect(() => {
    fetchCartCount();
    
    // Poll for cart updates (in a real app, you might use websockets or server-sent events)
    const interval = setInterval(fetchCartCount, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link 
      href="/warenkorb"
      className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <svg 
        className="w-6 h-6" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M17 19a2 2 0 100-4 2 2 0 000 4zm-8 0a2 2 0 100-4 2 2 0 000 4z" 
        />
      </svg>
      
      {cartData.itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {cartData.itemCount > 99 ? '99+' : cartData.itemCount}
        </span>
      )}
    </Link>
  );
}



