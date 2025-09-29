import CartClient from './cart-client';

export default function CartPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Warenkorb</h1>
      <CartClient />
    </div>
  );
}
