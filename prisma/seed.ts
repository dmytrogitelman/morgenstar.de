import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create brands
  const brand1 = await prisma.brand.upsert({
    where: { slug: 'morgenstar' },
    update: {},
    create: {
      slug: 'morgenstar',
      name: 'Morgenstar',
      logoUrl: '/logos/morgenstar.png'
    }
  });

  const brand2 = await prisma.brand.upsert({
    where: { slug: 'premium-coffee' },
    update: {},
    create: {
      slug: 'premium-coffee',
      name: 'Premium Coffee Co.',
      logoUrl: '/logos/premium-coffee.png'
    }
  });

  console.log('✅ Brands created');

  // Create categories
  const category1 = await prisma.category.upsert({
    where: { slug: 'kaffee-bohnen' },
    update: {},
    create: {
      slug: 'kaffee-bohnen',
      name: 'Kaffee Bohnen'
    }
  });

  const category2 = await prisma.category.upsert({
    where: { slug: 'espresso' },
    update: {},
    create: {
      slug: 'espresso',
      name: 'Espresso'
    }
  });

  const category3 = await prisma.category.upsert({
    where: { slug: 'filterkaffee' },
    update: {},
    create: {
      slug: 'filterkaffee',
      name: 'Filterkaffee'
    }
  });

  console.log('✅ Categories created');

  // Create products
  const product1 = await prisma.product.upsert({
    where: { slug: 'morgenstar-premium-espresso' },
    update: {},
    create: {
      slug: 'morgenstar-premium-espresso',
      title: 'Morgenstar Premium Espresso',
      subtitle: 'Hochwertiger Espresso für den perfekten Start in den Tag',
      description: 'Unser Premium Espresso wird aus sorgfältig ausgewählten Arabica-Bohnen hergestellt. Mit seinem kräftigen Geschmack und der cremigen Konsistenz ist er perfekt für Ihren morgendlichen Espresso oder Cappuccino.',
      brandId: brand1.id,
      ratingAvg: 4.5,
      ratingCnt: 23
    }
  });

  const product2 = await prisma.product.upsert({
    where: { slug: 'colombia-single-origin' },
    update: {},
    create: {
      slug: 'colombia-single-origin',
      title: 'Colombia Single Origin',
      subtitle: 'Einzigartiger Geschmack aus den kolumbianischen Anden',
      description: 'Diese Single Origin Bohnen aus Kolumbien bieten einen milden, ausgewogenen Geschmack mit fruchtigen Noten. Perfekt für Filterkaffee und French Press.',
      brandId: brand2.id,
      ratingAvg: 4.8,
      ratingCnt: 15
    }
  });

  const product3 = await prisma.product.upsert({
    where: { slug: 'ethiopia-yirgacheffe' },
    update: {},
    create: {
      slug: 'ethiopia-yirgacheffe',
      title: 'Ethiopia Yirgacheffe',
      subtitle: 'Exquisite Bohnen aus der Wiege des Kaffees',
      description: 'Yirgacheffe-Kaffee aus Äthiopien ist bekannt für seine blumigen und zitrusartigen Aromen. Ein wahrer Genuss für Kaffee-Liebhaber.',
      brandId: brand1.id,
      ratingAvg: 4.7,
      ratingCnt: 31
    }
  });

  console.log('✅ Products created');

  // Create product variants
  await prisma.productVariant.upsert({
    where: { sku: 'MSE-250' },
    update: {},
    create: {
      productId: product1.id,
      sku: 'MSE-250',
      name: '250g',
      priceCents: 1299,
      inStock: 50,
      weightGr: 250
    }
  });

  await prisma.productVariant.upsert({
    where: { sku: 'MSE-500' },
    update: {},
    create: {
      productId: product1.id,
      sku: 'MSE-500',
      name: '500g',
      priceCents: 2399,
      inStock: 30,
      weightGr: 500
    }
  });

  await prisma.productVariant.upsert({
    where: { sku: 'CSO-250' },
    update: {},
    create: {
      productId: product2.id,
      sku: 'CSO-250',
      name: '250g',
      priceCents: 1499,
      inStock: 40,
      weightGr: 250
    }
  });

  await prisma.productVariant.upsert({
    where: { sku: 'CSO-500' },
    update: {},
    create: {
      productId: product2.id,
      sku: 'CSO-500',
      name: '500g',
      priceCents: 2799,
      inStock: 25,
      weightGr: 500
    }
  });

  await prisma.productVariant.upsert({
    where: { sku: 'EY-250' },
    update: {},
    create: {
      productId: product3.id,
      sku: 'EY-250',
      name: '250g',
      priceCents: 1599,
      inStock: 35,
      weightGr: 250
    }
  });

  await prisma.productVariant.upsert({
    where: { sku: 'EY-500' },
    update: {},
    create: {
      productId: product3.id,
      sku: 'EY-500',
      name: '500g',
      priceCents: 2999,
      inStock: 20,
      weightGr: 500
    }
  });

  console.log('✅ Product variants created');

  // Connect products to categories
  await prisma.product.update({
    where: { id: product1.id },
    data: {
      categories: {
        connect: [{ id: category2.id }]
      }
    }
  });

  await prisma.product.update({
    where: { id: product2.id },
    data: {
      categories: {
        connect: [{ id: category3.id }]
      }
    }
  });

  await prisma.product.update({
    where: { id: product3.id },
    data: {
      categories: {
        connect: [{ id: category3.id }]
      }
    }
  });

  console.log('✅ Product categories connected');

  // Create sample reviews
  await prisma.review.createMany({
    data: [
      {
        productId: product1.id,
        rating: 5,
        title: 'Perfekter Espresso!',
        body: 'Wirklich ausgezeichneter Espresso. Kräftig und cremig, genau wie ich es mag.',
        verified: true
      },
      {
        productId: product1.id,
        rating: 4,
        title: 'Sehr gut',
        body: 'Guter Espresso, kann ich empfehlen.',
        verified: true
      },
      {
        productId: product2.id,
        rating: 5,
        title: 'Fantastischer Geschmack',
        body: 'Die kolumbianischen Bohnen haben einen wunderbaren Geschmack. Sehr zu empfehlen!',
        verified: true
      },
      {
        productId: product3.id,
        rating: 5,
        title: 'Einzigartig',
        body: 'Der Yirgacheffe ist wirklich etwas Besonderes. Die blumigen Noten sind wunderbar.',
        verified: true
      }
    ]
  });

  console.log('✅ Reviews created');

  // Create test user
  await prisma.user.upsert({
    where: { email: 'test@morgenstar.de' },
    update: {},
    create: {
      email: 'test@morgenstar.de',
      name: 'Test Benutzer',
      password: 'test123' // In production, this should be hashed
    }
  });

  console.log('✅ Test user created');

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });