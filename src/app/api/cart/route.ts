import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

export async function GET() {
  const jar = cookies();
  const cartId = jar.get('cart_id')?.value;
  
  if (!cartId) {
    return Response.json({ items: [], total: 0 });
  }

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  brand: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!cart) {
    return Response.json({ items: [], total: 0 });
  }

  const total = cart.items.reduce((sum, item) => sum + (item.variant.priceCents * item.qty), 0);

  return Response.json({
    items: cart.items,
    total,
    itemCount: cart.items.reduce((sum, item) => sum + item.qty, 0)
  });
}

export async function POST(req: Request) {
  const { variantId, qty } = await req.json();
  const jar = cookies();
  let cartId = jar.get('cart_id')?.value;
  
  if (!cartId) {
    const cart = await prisma.cart.create({ data: {} });
    cartId = cart.id;
    jar.set('cart_id', cartId, { httpOnly: true, sameSite: 'lax', secure: true, path: '/' });
  }
  
  const cart = await prisma.cart.findUnique({ where: { id: cartId } });
  if (!cart) return new Response('no cart', { status: 400 });
  
  const existing = await prisma.cartItem.findFirst({ 
    where: { cartId: cart.id, variantId } 
  });
  
  if (existing) {
    await prisma.cartItem.update({ 
      where: { id: existing.id }, 
      data: { qty: existing.qty + (qty ?? 1) } 
    });
  } else {
    await prisma.cartItem.create({ 
      data: { cartId: cart.id, variantId, qty: qty ?? 1 } 
    });
  }
  
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get('itemId');
  
  if (!itemId) {
    return new Response('itemId required', { status: 400 });
  }

  await prisma.cartItem.delete({
    where: { id: itemId }
  });

  return Response.json({ ok: true });
}

export async function PUT(req: Request) {
  const { itemId, qty } = await req.json();
  
  if (!itemId || qty < 1) {
    return new Response('Invalid parameters', { status: 400 });
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { qty }
  });

  return Response.json({ ok: true });
}

