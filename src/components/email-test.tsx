'use client';

import { useState } from 'react';

export default function EmailTest() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Test-E-Mail erfolgreich gesendet!');
        setEmail('');
      } else {
        setMessage(`❌ Fehler: ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Fehler beim Senden der Test-E-Mail');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">📧 Email-System Test</h3>
      
      <form onSubmit={handleTestEmail} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            E-Mail-Adresse für Test
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="test@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !email}
          className="w-full bg-amber-600 text-white py-2 px-4 rounded-md font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Wird gesendet...' : 'Test-E-Mail senden'}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-md ${
          message.includes('✅') 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Hinweis:</strong> Stellen Sie sicher, dass die SMTP-Konfiguration in der .env-Datei korrekt ist:</p>
        <ul className="mt-2 space-y-1">
          <li>• SMTP_HOST (z.B. smtp.gmail.com)</li>
          <li>• SMTP_PORT (z.B. 587)</li>
          <li>• SMTP_USER (Ihre E-Mail-Adresse)</li>
          <li>• SMTP_PASS (App-Passwort)</li>
        </ul>
      </div>
    </div>
  );
}

