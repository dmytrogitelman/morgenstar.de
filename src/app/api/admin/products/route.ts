import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    // TODO: Add admin role check

    const products = await prisma.product.findMany({
      include: {
        variants: true,
        brand: true,
        categories: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ products });

  } catch (error) {
    console.error('Admin products error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Produkte' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    // TODO: Add admin role check

    const { title, description, brandId, categoryIds, variants } = await request.json();

    // Validation
    if (!title || !variants || variants.length === 0) {
      return NextResponse.json(
        { error: 'Titel und mindestens eine Variante sind erforderlich' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Ein Produkt mit diesem Titel existiert bereits' },
        { status: 400 }
      );
    }

    // Create product with variants
    const product = await prisma.product.create({
      data: {
        title,
        description,
        slug,
        brandId: brandId || null,
        variants: {
          create: variants.map((variant: any) => ({
            name: variant.name,
            sku: variant.sku,
            priceCents: variant.priceCents,
            inStock: variant.inStock || 0,
            weightGr: variant.weightGr || null
          }))
        },
        categories: {
          connect: categoryIds?.map((id: string) => ({ id })) || []
        }
      },
      include: {
        variants: true,
        brand: true,
        categories: true
      }
    });

    return NextResponse.json({
      message: 'Produkt erfolgreich erstellt',
      product
    });

  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: 'Fehler bei der Produkterstellung' },
      { status: 500 }
    );
  }
}


