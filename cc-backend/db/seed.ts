import { faker } from '@faker-js/faker';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import {
  customers,
  users,
  addresses,
  products,
  productVariants,
  inventory,
  locations,
  orders,
  orderItems,
  discounts,
  orderDiscounts,
  payments
} from './schema';

// Load environment variables
config();

// Database connection (Supabase PostgreSQL)
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}
const client = postgres(connectionString, {
  ssl: 'require', // Supabase requires SSL
});
const db = drizzle(client);

async function seedDatabase() {
  console.log('🌱 Starting to seed database with essential tables...');

  try {
    // Clear existing data in reverse dependency order
    console.log('🧹 Clearing existing data from ALL tables...');
    
    // Delete in order of dependencies (child tables first, then parent tables)
    // Clear all tables to avoid foreign key conflicts
    await db.delete(payments);
    console.log('   ✓ Cleared payments');
    
    await db.delete(orderDiscounts);
    console.log('   ✓ Cleared order discounts');
    
    await db.delete(orderItems);
    console.log('   ✓ Cleared order items');
    
    await db.delete(orders);
    console.log('   ✓ Cleared orders');
    
    await db.delete(addresses);
    console.log('   ✓ Cleared addresses');
    
    await db.delete(users);
    console.log('   ✓ Cleared users');
    
    await db.delete(customers);
    console.log('   ✓ Cleared customers');
    
    await db.delete(inventory);
    console.log('   ✓ Cleared inventory');
    
    await db.delete(productVariants);
    console.log('   ✓ Cleared product variants');
    
    await db.delete(products);
    console.log('   ✓ Cleared products');
    
    await db.delete(discounts);
    console.log('   ✓ Cleared discounts');
    
    await db.delete(locations);
    console.log('   ✓ Cleared locations');
    
    console.log('🧹 All tables cleared! Starting fresh data insertion...\n');

    // 1. Create Locations (stores) - No dependencies
    console.log('🏪 Creating store locations...');
    const locationIds: number[] = [];
    for (let i = 0; i < 5; i++) {
      const [location] = await db.insert(locations).values({
        storeNumber: faker.number.int({ min: 1000, max: 9999 }),
        storeAddress: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state({ abbreviated: true }),
          zipCode: faker.location.zipCode(),
          country: 'US'
        },
      }).returning({ id: locations.id });
      locationIds.push(location.id);
    }

    // 2. Create Products (Real Grocery Items) - No dependencies
    console.log('📦 Creating realistic grocery products...');
    const productIds: number[] = [];
    
    const realGroceryProducts = [
      // PRODUCE
      { name: 'Organic Bananas', brand: 'Fresh Farms', category: 'PRODUCE', price: '2.99', description: 'Fresh organic bananas, perfect for snacking or smoothies' },
      { name: 'Gala Apples', brand: 'Orchard Fresh', category: 'PRODUCE', price: '3.49', description: 'Crisp and sweet Gala apples, great for lunch boxes' },
      { name: 'Baby Spinach', brand: 'Green Valley', category: 'PRODUCE', price: '4.99', description: 'Fresh baby spinach leaves, pre-washed and ready to eat' },
      { name: 'Roma Tomatoes', brand: 'Garden Select', category: 'PRODUCE', price: '2.79', description: 'Fresh Roma tomatoes, perfect for cooking and salads' },
      { name: 'Organic Carrots', brand: 'Nature\'s Best', category: 'PRODUCE', price: '2.49', description: 'Organic carrots, sweet and crunchy' },
      { name: 'Red Bell Peppers', brand: 'Fresh Farms', category: 'PRODUCE', price: '4.99', description: 'Sweet red bell peppers, great for cooking or raw snacking' },
      { name: 'Russet Potatoes', brand: 'Farm Fresh', category: 'PRODUCE', price: '3.99', description: '5lb bag of russet potatoes, perfect for baking or mashing' },
      { name: 'Avocados', brand: 'Premium Select', category: 'PRODUCE', price: '1.99', description: 'Ripe avocados, perfect for guacamole or toast' },

      // MEAT
      { name: 'Ground Beef 80/20', brand: 'Premium Butcher', category: 'MEAT', price: '6.99', description: 'Fresh ground beef, 80% lean, perfect for burgers and tacos' },
      { name: 'Boneless Chicken Breast', brand: 'Farm Fresh Poultry', category: 'MEAT', price: '8.99', description: 'Fresh boneless, skinless chicken breast' },
      { name: 'Pork Tenderloin', brand: 'Heritage Farms', category: 'MEAT', price: '12.99', description: 'Tender pork tenderloin, great for roasting' },
      { name: 'Turkey Slices', brand: 'Deli Fresh', category: 'MEAT', price: '7.49', description: 'Sliced turkey breast, perfect for sandwiches' },
      { name: 'Bacon', brand: 'Smokehouse', category: 'MEAT', price: '5.99', description: 'Thick-cut bacon, perfect for breakfast' },

      // SEAFOOD
      { name: 'Atlantic Salmon Fillet', brand: 'Ocean Fresh', category: 'SEAFOOD', price: '14.99', description: 'Fresh Atlantic salmon fillet, rich in omega-3' },
      { name: 'Large Shrimp', brand: 'Coastal Catch', category: 'SEAFOOD', price: '12.99', description: 'Fresh large shrimp, peeled and deveined' },
      { name: 'Cod Fillet', brand: 'Deep Sea', category: 'SEAFOOD', price: '11.99', description: 'Fresh cod fillet, mild and flaky' },

      // BAKERY
      { name: 'Sourdough Bread', brand: 'Artisan Bakery', category: 'BAKERY', price: '3.99', description: 'Fresh baked sourdough bread loaf' },
      { name: 'Chocolate Croissants', brand: 'French Baker', category: 'BAKERY', price: '4.49', description: 'Buttery croissants filled with chocolate' },
      { name: 'Bagels - Everything', brand: 'NY Style', category: 'BAKERY', price: '2.99', description: 'Fresh everything bagels, pack of 6' },
      { name: 'Dinner Rolls', brand: 'Home Style', category: 'BAKERY', price: '2.49', description: 'Soft dinner rolls, pack of 8' },

      // DAIRY
      { name: 'Whole Milk', brand: 'Dairy Fresh', category: 'DAIRY', price: '3.49', description: 'Fresh whole milk, 1 gallon' },
      { name: 'Greek Yogurt', brand: 'Mountain High', category: 'DAIRY', price: '5.99', description: 'Plain Greek yogurt, high in protein' },
      { name: 'Cheddar Cheese', brand: 'Aged Select', category: 'DAIRY', price: '4.99', description: 'Sharp cheddar cheese, 8oz block' },
      { name: 'Butter', brand: 'Creamery Gold', category: 'DAIRY', price: '4.49', description: 'Unsalted butter, 1lb package' },
      { name: 'Eggs', brand: 'Farm Fresh', category: 'DAIRY', price: '2.99', description: 'Large grade A eggs, dozen' },
      { name: 'Cream Cheese', brand: 'Philadelphia', category: 'DAIRY', price: '2.49', description: 'Original cream cheese, 8oz package' },

      // DELI
      { name: 'Ham Slices', brand: 'Deli Premium', category: 'DELI', price: '6.99', description: 'Honey ham slices, perfect for sandwiches' },
      { name: 'Swiss Cheese', brand: 'Imported Select', category: 'DELI', price: '7.49', description: 'Swiss cheese slices, imported quality' },
      { name: 'Roast Beef', brand: 'Deli Choice', category: 'DELI', price: '8.99', description: 'Lean roast beef slices, freshly cut' },

      // PANTRY
      { name: 'Pasta - Spaghetti', brand: 'Barilla', category: 'PANTRY', price: '1.99', description: 'Premium spaghetti pasta, 1lb box' },
      { name: 'Rice - Jasmine', brand: 'Royal', category: 'PANTRY', price: '4.99', description: 'Fragrant jasmine rice, 2lb bag' },
      { name: 'Olive Oil', brand: 'Mediterranean Gold', category: 'PANTRY', price: '8.99', description: 'Extra virgin olive oil, 500ml bottle' },
      { name: 'Canned Tomatoes', brand: 'Hunt\'s', category: 'PANTRY', price: '1.49', description: 'Diced tomatoes, 14.5oz can' },
      { name: 'Black Beans', brand: 'Bush\'s', category: 'PANTRY', price: '1.29', description: 'Black beans, 15oz can' },
      { name: 'Peanut Butter', brand: 'Jif', category: 'PANTRY', price: '3.99', description: 'Creamy peanut butter, 18oz jar' },
      { name: 'Cereal - Cheerios', brand: 'General Mills', category: 'PANTRY', price: '4.49', description: 'Original Cheerios cereal, family size' },
      { name: 'Granola Bars', brand: 'Nature Valley', category: 'PANTRY', price: '3.99', description: 'Crunchy granola bars, variety pack' },

      // FROZEN
      { name: 'Frozen Pizza', brand: 'DiGiorno', category: 'FROZEN', price: '5.99', description: 'Four cheese rising crust pizza' },
      { name: 'Ice Cream - Vanilla', brand: 'Häagen-Dazs', category: 'FROZEN', price: '6.99', description: 'Premium vanilla ice cream, pint' },
      { name: 'Frozen Berries', brand: 'Cascadian Farm', category: 'FROZEN', price: '4.99', description: 'Organic mixed berries, 10oz bag' },
      { name: 'Frozen Vegetables', brand: 'Green Giant', category: 'FROZEN', price: '2.99', description: 'Mixed vegetables, steam-in-bag' },
      { name: 'Waffles', brand: 'Eggo', category: 'FROZEN', price: '3.49', description: 'Homestyle waffles, 10 count' },

      // BEVERAGES
      { name: 'Orange Juice', brand: 'Tropicana', category: 'BEVERAGES', price: '4.49', description: 'Pure premium orange juice, 59oz carton' },
      { name: 'Coffee - Ground', brand: 'Folgers', category: 'BEVERAGES', price: '6.99', description: 'Classic roast ground coffee, 30.5oz container' },
      { name: 'Sparkling Water', brand: 'La Croix', category: 'BEVERAGES', price: '4.99', description: 'Lime flavored sparkling water, 12-pack' },
      { name: 'Green Tea', brand: 'Lipton', category: 'BEVERAGES', price: '3.49', description: 'Green tea bags, 20 count' },
      { name: 'Apple Juice', brand: 'Mott\'s', category: 'BEVERAGES', price: '3.99', description: '100% apple juice, 64oz bottle' },

      // HOME_ESSENTIALS
      { name: 'Paper Towels', brand: 'Bounty', category: 'HOME_ESSENTIALS', price: '12.99', description: 'Select-a-size paper towels, 8 rolls' },
      { name: 'Toilet Paper', brand: 'Charmin', category: 'HOME_ESSENTIALS', price: '15.99', description: 'Ultra soft toilet paper, 12 mega rolls' },
      { name: 'Dish Soap', brand: 'Dawn', category: 'HOME_ESSENTIALS', price: '2.99', description: 'Original dish soap, 19.4oz bottle' },
      { name: 'Laundry Detergent', brand: 'Tide', category: 'HOME_ESSENTIALS', price: '11.99', description: 'Original scent detergent, 64 loads' },
      { name: 'Trash Bags', brand: 'Glad', category: 'HOME_ESSENTIALS', price: '8.99', description: 'ForceFlex drawstring bags, 13 gallon, 80 count' },

      // HEALTH_AND_BEAUTY
      { name: 'Toothpaste', brand: 'Colgate', category: 'HEALTH_AND_BEAUTY', price: '3.49', description: 'Total whitening toothpaste, 4.8oz tube' },
      { name: 'Shampoo', brand: 'Pantene', category: 'HEALTH_AND_BEAUTY', price: '5.99', description: 'Pro-V daily moisture shampoo, 12.6oz' },
      { name: 'Body Wash', brand: 'Dove', category: 'HEALTH_AND_BEAUTY', price: '4.99', description: 'Moisturizing body wash, 22oz bottle' },
      { name: 'Deodorant', brand: 'Secret', category: 'HEALTH_AND_BEAUTY', price: '3.99', description: 'Invisible solid antiperspirant, 2.6oz' },

      // BABY
      { name: 'Baby Food - Bananas', brand: 'Gerber', category: 'BABY', price: '1.29', description: '1st foods bananas, 2.5oz jar' },
      { name: 'Diapers', brand: 'Pampers', category: 'BABY', price: '24.99', description: 'Baby dry diapers, size 3, 174 count' },
      { name: 'Baby Wipes', brand: 'Huggies', category: 'BABY', price: '4.99', description: 'Natural care baby wipes, 56 count' },
      { name: 'Baby Formula', brand: 'Similac', category: 'BABY', price: '29.99', description: 'Advance infant formula, 23.2oz container' },
    ];

    for (const productData of realGroceryProducts) {
      const [product] = await db.insert(products).values({
        name: productData.name,
        description: productData.description,
        category: productData.category as any,
        unitPrice: productData.price,
        brand: productData.brand,
      }).returning({ id: products.id });
      productIds.push(product.id);
    }

    // 3. Create Product Variants (Depends on products)
    console.log('🎨 Creating realistic product variants...');
    const productVariantIds: number[] = [];
    
    // Define realistic variants based on product categories and names
    const getRealisticVariants = (productName: string, category: string) => {
      const name = productName.toLowerCase();
      
      // Produce - mostly size variants
      if (category === 'PRODUCE') {
        if (name.includes('banana')) return [{ size: 'Bunch', flavor: null }];
        if (name.includes('apple')) return [{ size: 'Bag (3lb)', flavor: null }, { size: 'Individual', flavor: null }];
        if (name.includes('spinach')) return [{ size: '5oz', flavor: null }, { size: '10oz', flavor: null }];
        if (name.includes('tomato')) return [{ size: '1lb', flavor: null }, { size: '2lb', flavor: null }];
        if (name.includes('carrot')) return [{ size: '1lb bag', flavor: null }, { size: '2lb bag', flavor: null }];
        if (name.includes('pepper')) return [{ size: '3-pack', flavor: null }, { size: 'Individual', flavor: null }];
        if (name.includes('potato')) return [{ size: '5lb bag', flavor: null }, { size: '10lb bag', flavor: null }];
        if (name.includes('avocado')) return [{ size: 'Individual', flavor: null }, { size: '4-pack', flavor: null }];
        return [{ size: 'Regular', flavor: null }];
      }
      
      // Meat - mostly size/cut variants
      if (category === 'MEAT') {
        if (name.includes('ground beef')) return [{ size: '1lb', flavor: null }, { size: '2lb', flavor: null }];
        if (name.includes('chicken')) return [{ size: '1lb', flavor: null }, { size: '2lb', flavor: null }];
        if (name.includes('pork')) return [{ size: '1lb', flavor: null }, { size: '1.5lb', flavor: null }];
        if (name.includes('turkey')) return [{ size: '0.5lb', flavor: null }, { size: '1lb', flavor: null }];
        if (name.includes('bacon')) return [{ size: '12oz', flavor: null }, { size: '16oz', flavor: null }];
        return [{ size: '1lb', flavor: null }];
      }
      
      // Seafood - mostly size variants
      if (category === 'SEAFOOD') {
        if (name.includes('salmon')) return [{ size: '6oz fillet', flavor: null }, { size: '8oz fillet', flavor: null }];
        if (name.includes('shrimp')) return [{ size: '1lb', flavor: null }, { size: '2lb', flavor: null }];
        if (name.includes('cod')) return [{ size: '6oz fillet', flavor: null }, { size: '8oz fillet', flavor: null }];
        return [{ size: '1lb', flavor: null }];
      }
      
      // Bakery - size variants
      if (category === 'BAKERY') {
        if (name.includes('bread')) return [{ size: 'Regular loaf', flavor: null }, { size: 'Large loaf', flavor: null }];
        if (name.includes('croissant')) return [{ size: '4-pack', flavor: null }, { size: '6-pack', flavor: null }];
        if (name.includes('bagel')) return [{ size: '6-pack', flavor: null }, { size: '12-pack', flavor: null }];
        if (name.includes('roll')) return [{ size: '8-pack', flavor: null }, { size: '12-pack', flavor: null }];
        return [{ size: 'Regular', flavor: null }];
      }
      
      // Dairy - size and sometimes flavor variants
      if (category === 'DAIRY') {
        if (name.includes('milk')) return [{ size: 'Half gallon', flavor: null }, { size: '1 gallon', flavor: null }];
        if (name.includes('yogurt')) return [
          { size: '32oz', flavor: 'Plain' }, 
          { size: '32oz', flavor: 'Vanilla' }, 
          { size: '32oz', flavor: 'Strawberry' }
        ];
        if (name.includes('cheese')) return [{ size: '8oz', flavor: null }, { size: '16oz', flavor: null }];
        if (name.includes('butter')) return [{ size: '1lb', flavor: null }, { size: '2lb', flavor: null }];
        if (name.includes('eggs')) return [{ size: 'Dozen', flavor: null }, { size: '18-count', flavor: null }];
        if (name.includes('cream cheese')) return [{ size: '8oz', flavor: null }, { size: '16oz', flavor: null }];
        return [{ size: 'Regular', flavor: null }];
      }
      
      // Deli - size variants
      if (category === 'DELI') {
        return [{ size: '0.5lb', flavor: null }, { size: '1lb', flavor: null }];
      }
      
      // Pantry - size variants mostly
      if (category === 'PANTRY') {
        if (name.includes('pasta')) return [{ size: '1lb box', flavor: null }, { size: '2lb box', flavor: null }];
        if (name.includes('rice')) return [{ size: '2lb bag', flavor: null }, { size: '5lb bag', flavor: null }];
        if (name.includes('oil')) return [{ size: '500ml', flavor: null }, { size: '1L', flavor: null }];
        if (name.includes('tomatoes') || name.includes('beans')) return [{ size: '14.5oz can', flavor: null }, { size: '28oz can', flavor: null }];
        if (name.includes('peanut butter')) return [{ size: '18oz', flavor: 'Creamy' }, { size: '18oz', flavor: 'Crunchy' }];
        if (name.includes('cereal')) return [{ size: 'Regular', flavor: null }, { size: 'Family size', flavor: null }];
        if (name.includes('granola')) return [{ size: '6-pack', flavor: 'Oats & Honey' }, { size: '6-pack', flavor: 'Crunchy' }];
        return [{ size: 'Regular', flavor: null }];
      }
      
      // Frozen - size and flavor variants
      if (category === 'FROZEN') {
        if (name.includes('pizza')) return [{ size: 'Personal', flavor: null }, { size: 'Family size', flavor: null }];
        if (name.includes('ice cream')) return [
          { size: 'Pint', flavor: 'Vanilla' }, 
          { size: 'Pint', flavor: 'Chocolate' }, 
          { size: 'Half gallon', flavor: 'Vanilla' }
        ];
        if (name.includes('berries')) return [{ size: '10oz bag', flavor: null }, { size: '16oz bag', flavor: null }];
        if (name.includes('vegetables')) return [{ size: '12oz bag', flavor: null }, { size: '16oz bag', flavor: null }];
        if (name.includes('waffles')) return [{ size: '10-count', flavor: null }, { size: '24-count', flavor: null }];
        return [{ size: 'Regular', flavor: null }];
      }
      
      // Beverages - size and flavor variants
      if (category === 'BEVERAGES') {
        if (name.includes('juice')) return [{ size: '59oz', flavor: null }, { size: '89oz', flavor: null }];
        if (name.includes('coffee')) return [{ size: '30.5oz', flavor: null }, { size: '48oz', flavor: null }];
        if (name.includes('water')) return [
          { size: '12-pack', flavor: 'Lime' }, 
          { size: '12-pack', flavor: 'Lemon' }, 
          { size: '24-pack', flavor: 'Lime' }
        ];
        if (name.includes('tea')) return [{ size: '20-count', flavor: null }, { size: '40-count', flavor: null }];
        return [{ size: 'Regular', flavor: null }];
      }
      
      // Home Essentials - size variants
      if (category === 'HOME_ESSENTIALS') {
        if (name.includes('paper towels')) return [{ size: '6-pack', flavor: null }, { size: '12-pack', flavor: null }];
        if (name.includes('toilet paper')) return [{ size: '12-pack', flavor: null }, { size: '24-pack', flavor: null }];
        if (name.includes('soap')) return [{ size: '19.4oz', flavor: null }, { size: '38oz', flavor: null }];
        if (name.includes('detergent')) return [{ size: '64 loads', flavor: null }, { size: '128 loads', flavor: null }];
        if (name.includes('bags')) return [{ size: '80-count', flavor: null }, { size: '120-count', flavor: null }];
        return [{ size: 'Regular', flavor: null }];
      }
      
      // Health & Beauty - size and sometimes scent variants
      if (category === 'HEALTH_AND_BEAUTY') {
        if (name.includes('toothpaste')) return [{ size: '4.8oz', flavor: 'Mint' }, { size: '6oz', flavor: 'Mint' }];
        if (name.includes('shampoo')) return [{ size: '12.6oz', flavor: null }, { size: '25.4oz', flavor: null }];
        if (name.includes('body wash')) return [{ size: '22oz', flavor: 'Original' }, { size: '22oz', flavor: 'Cucumber' }];
        if (name.includes('deodorant')) return [{ size: '2.6oz', flavor: 'Unscented' }, { size: '2.6oz', flavor: 'Fresh' }];
        return [{ size: 'Regular', flavor: null }];
      }
      
      // Baby - size and age variants
      if (category === 'BABY') {
        if (name.includes('food')) return [{ size: '2.5oz jar', flavor: null }, { size: '4oz jar', flavor: null }];
        if (name.includes('diapers')) return [{ size: 'Size 1', flavor: null }, { size: 'Size 2', flavor: null }, { size: 'Size 3', flavor: null }];
        if (name.includes('wipes')) return [{ size: '56-count', flavor: null }, { size: '80-count', flavor: null }];
        if (name.includes('formula')) return [{ size: '23.2oz', flavor: null }, { size: '35.2oz', flavor: null }];
        return [{ size: 'Regular', flavor: null }];
      }
      
      // Default fallback
      return [{ size: 'Regular', flavor: null }];
    };

    for (let i = 0; i < productIds.length; i++) {
      const productId = productIds[i];
      const productData = realGroceryProducts[i];
      const variants = getRealisticVariants(productData.name, productData.category);
      
      for (const variant of variants) {
        const [createdVariant] = await db.insert(productVariants).values({
          productId,
          size: variant.size,
          flavor: variant.flavor,
          sku: faker.string.uuid(),
        }).returning({ id: productVariants.id });
        productVariantIds.push(createdVariant.id);
      }
    }

    // 4. Create Discounts (No dependencies)
    console.log('💰 Creating discounts...');
    const discountIds: number[] = [];
    const discountTypes = ['PERCENTAGE', 'FIXED', 'BOGO'];
    
    for (let i = 0; i < 20; i++) {
      const discountType = faker.helpers.arrayElement(discountTypes);
      let value: number;
      
      switch (discountType) {
        case 'PERCENTAGE':
          value = faker.number.float({ min: 5, max: 50, multipleOf: 5 }); // 5%, 10%, 15%, etc.
          break;
        case 'FIXED':
          value = faker.number.float({ min: 5, max: 100, multipleOf: 5 }); // $5, $10, $15, etc.
          break;
        case 'BOGO':
          value = faker.number.int({ min: 2, max: 5 }); // Buy 2 get 1, etc.
          break;
        default:
          value = 10;
      }

      const [discount] = await db.insert(discounts).values({
        code: faker.string.alphanumeric({ length: 8, casing: 'upper' }),
        type: discountType as any,
        value: value.toString(),
        description: `${discountType === 'PERCENTAGE' ? value + '% off' : 
                     discountType === 'FIXED' ? '$' + value + ' off' : 
                     'Buy ' + value + ' get 1 free'}`,
        usageLimit: faker.number.int({ min: 10, max: 1000 }),
        timesUsed: faker.number.int({ min: 0, max: 50 }),
        startsAt: faker.date.past({ years: 1 }),
        expiresAt: faker.date.future({ years: 1 }),
        isActive: faker.datatype.boolean(0.8),
      }).returning({ id: discounts.id });
      discountIds.push(discount.id);
    }

    // 5. Create Inventory (Depends on product variants and locations)
    console.log('� Creating inventory records...');
    for (const variantId of productVariantIds) {
      for (const locationId of locationIds) {
        // Not all variants are in all locations
        if (faker.datatype.boolean(0.7)) {
          await db.insert(inventory).values({
            productVariantId: variantId,
            locationId,
            quantity: faker.number.int({ min: 0, max: 100 }),
          });
        }
      }
    }

    console.log('✅ Database seeding completed successfully!');
    console.log(`
📊 Generated:
   🏪 ${locationIds.length} store locations
   📦 ${productIds.length} realistic grocery products
   🎨 ${productVariantIds.length} product variants
   💰 ${discountIds.length} discounts
   � ${Math.floor(productVariantIds.length * locationIds.length * 0.7)} inventory records
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await client.end();
  }
}

// Run the seed function
seedDatabase().catch(console.error);
