'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export default function WishlistButton({ productId, className = '' }: WishlistButtonProps) {
  const { data: session } = useSession();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      checkWishlistStatus();
    }
  }, [session, productId]);

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch('/api/wishlist');
      if (response.ok) {
        const wishlist = await response.json();
        const isWishlisted = wishlist.some((item: any) => item.productId === productId);
        setIsInWishlist(isWishlisted);
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const toggleWishlist = async () => {
    if (!session?.user?.id) {
      // Redirect to login or show login modal
      window.location.href = '/anmelden';
      return;
    }

    setIsLoading(true);
    try {
      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch(`/api/wishlist?productId=${productId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setIsInWishlist(false);
        }
      } else {
        // Add to wishlist
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId }),
        });
        
        if (response.ok) {
          setIsInWishlist(true);
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user?.id) {
    return (
      <button
        onClick={toggleWishlist}
        className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
        title="Anmelden für Wunschliste"
      >
        <span className="text-gray-400">♡</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleWishlist}
      disabled={isLoading}
      className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className} ${
        isLoading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      title={isInWishlist ? 'Aus Wunschliste entfernen' : 'Zur Wunschliste hinzufügen'}
    >
      <span className={`transition-colors ${
        isInWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
      }`}>
        {isInWishlist ? '♥' : '♡'}
      </span>
    </button>
  );
}
