import CheckoutClient from './checkout-client';

export default function CheckoutPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Kasse</h1>
      <CheckoutClient />
    </div>
  );
}


