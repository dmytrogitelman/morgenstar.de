'use client';

import { useState } from 'react';
import { trackNewsletterSignup } from '@/lib/analytics';

interface NewsletterSignupProps {
  className?: string;
  showTitle?: boolean;
}

export default function NewsletterSignup({ 
  className = '', 
  showTitle = true 
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage('Bitte geben Sie eine E-Mail-Adresse ein');
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setIsSuccess(true);
        setEmail('');
        setName('');
        
        // Track newsletter signup
        trackNewsletterSignup();
      } else {
        setMessage(data.error || 'Ein Fehler ist aufgetreten');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('Ein Fehler ist aufgetreten');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 ${className}`}>
      {showTitle && (
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            📧 Newsletter
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Bleiben Sie auf dem Laufenden über neue Kaffeesorten und Angebote!
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ihr Name (optional)"
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ihre E-Mail-Adresse"
            required
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {isLoading ? '...' : 'Anmelden'}
          </button>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            isSuccess 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
          }`}>
            {message}
          </div>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Mit der Anmeldung stimmen Sie zu, dass wir Ihnen E-Mails mit Angeboten und Neuigkeiten senden. 
          Sie können sich jederzeit abmelden.
        </p>
      </form>
    </div>
  );
}
