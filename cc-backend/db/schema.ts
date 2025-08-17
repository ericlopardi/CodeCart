import { pgTable, pgEnum, serial, text, timestamp, boolean, integer, numeric, jsonb, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/* -------------------- Enumerations -------------------- */
export const orderStatusEnum = pgEnum('order_status', ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);

export const orderTypeEnum = pgEnum('order_types', ['DELIVERY', 'PICKUP']);

export const productCategoryEnum = pgEnum('product_categories', ['PRODUCE', 'MEAT', 'SEAFOOD', 'BAKERY', 'DAIRY', 'DELI', 'PANTRY', 'FROZEN', 'BEVERAGES', 'HOME_ESSENTIALS', 'HEALTH_AND_BEAUTY', 'BABY']);

/* -------------------- Users -------------------- */
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    customerId: integer('customer_id').notNull().unique().references(() => customers.id, {onDelete: 'cascade'}),
    email: text('email').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    isActive: boolean('is_active').default(true),
});

/* -------------------- Customers -------------------- */
export const customers = pgTable('customers', {
    id: serial('id').primaryKey(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    phoneNumber: text('phone_number'),
    email: text('email').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(), 
});

/* -------------------- Orders -------------------- */
export const orders = pgTable('orders', {
    id: serial('id').primaryKey(),
    customerId: integer('customer_id').unique().notNull().references(() => customers.id, {onDelete: 'cascade'}),
    status: orderStatusEnum().notNull(),
    totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
    deliveryAddress: jsonb('delivery_address'),
    createdAt: timestamp('created_at', { withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    addressId: integer('address_id').references(() => addresses.id, {onDelete: 'cascade'}),
    orderType: orderTypeEnum().notNull()
});

/* -------------------- OrderItems -------------------- */
export const orderItems = pgTable('order_items', {
    id: serial('id').primaryKey(),
    orderId: integer('order_id').references(() => orders.id, {onDelete: 'cascade'}),
    productVariantId: integer('product_variant_id').unique().notNull().references(() => productVariants.id, {onDelete: 'cascade'}),
    quantity: integer('quantity').notNull(),
    unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
    discount: numeric('discount', { precision: 10, scale: 2 })
})


/* -------------------- Addresses -------------------- */
export const addresses = pgTable('addresses', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').unique().notNull().references(() => users.id, {onDelete: 'cascade'}),
    streetAddress: text('street_address').notNull(),
    city: text('city').notNull(),
    state: text('state').notNull(),
    zipCode: text('zip_code').notNull(),
    country: text('country').notNull(),
    isDefault: boolean('is_default').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

/* -------------------- Products -------------------- */
export const products = pgTable('products', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
    category: productCategoryEnum().notNull(),
    brand: text('brand').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

/* -------------------- ProductVariants -------------------- */
export const productVariants = pgTable('productVariants', {
    id: serial('id').primaryKey(),
    sku: uuid('sku').notNull().unique(),
    size: text('size').notNull(),
    flavor: text('flavor'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    imagePath: text('image_path').unique(),
    productId: integer('product_id').notNull().references(() => products.id, {onDelete: 'cascade'}),
})

/* -------------------- Inventory -------------------- */
export const inventory = pgTable('inventory', {
    id: serial('id').primaryKey(),
    productVariantId: integer('product_variant_id').notNull().references(() => productVariants.id, {onDelete: 'cascade'}),
    locationId: integer('location_id').notNull().references(() => location.id, {onDelete: 'cascade'}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    quantity: integer('quantity').notNull().default(0),
})

/* -------------------- Location -------------------- */
export const location = pgTable('locations', {
    id: serial('id').primaryKey(),
    storeName: integer('store_number').notNull().unique(),
    storeAddress: jsonb('store_address').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

/* -------------------- Relations -------------------- */
export const usersRelations = relations(users, ({ one, many }) => ({
    customer: one(customers, {
        fields: [users.customerId],
        references: [customers.id],
    }),
    addresses: many(users),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
    user: one(users, {
        fields: [customers.id],
        references: [users.customerId]
    }),
    orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
    customer: one(customers, {
        fields: [orders.customerId],
        references: [customers.id],
    })
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
    user: one(users, {
        fields: [addresses.userId],
        references: [users.id],
    })
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
    product: one(products, {
        fields: [productVariants.productId],
        references: [products.id]
    })
}));

export const productsRelations = relations(products, ({ many }) => ({
    variants: many(productVariants),
}));

export const locationsRelations = relations(location, ({ one }) => ({
    inventory: one(inventory, {
        fields: [location.id],
        references: [inventory.locationId]
    })
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
    productVariant: one(productVariants, {
        fields: [inventory.productVariantId],
        references: [productVariants.id]
    }),
    location: one(location, {
        fields: [inventory.locationId],
        references: [location.id]
    })
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.id]
    }),
    productVariant: one(productVariants, {
        fields: [orderItems.productVariantId],
        references: [productVariants.id]
    })
}));