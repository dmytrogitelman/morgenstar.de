import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import WishlistClient from './wishlist-client';

export const metadata = {
  title: 'Wunschliste | Morgenstar',
  description: 'Ihre Wunschliste bei Morgenstar Kaffee',
};

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/anmelden?callbackUrl=/wunschliste');
  }

  const wishlist = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          variants: {
            orderBy: { priceCents: 'asc' },
          },
          brand: true,
          categories: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return <WishlistClient wishlist={wishlist} />;
}
