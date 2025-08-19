import { pgTable, pgEnum, serial, text, timestamp, boolean, integer, numeric, jsonb, uuid, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/* -------------------- Enumerations -------------------- */
export const orderStatusEnum = pgEnum('order_status', ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);

export const orderTypeEnum = pgEnum('order_type', ['DELIVERY', 'PICKUP']);

export const productCategoryEnum = pgEnum('product_category', ['PRODUCE', 'MEAT', 'SEAFOOD', 'BAKERY', 'DAIRY', 'DELI', 'PANTRY', 'FROZEN', 'BEVERAGES', 'HOME_ESSENTIALS', 'HEALTH_AND_BEAUTY', 'BABY']);

export const discountTypesEnum = pgEnum('discount_types', ['PERCENTAGE', 'FIXED', 'BOGO']);

export const paymentMethodsEnum = pgEnum('payment_methods', ['CARD']);

export const paymentStatusEnum = pgEnum('payment_status', ['PENDING', 'COMPLETED', 'REFUND', 'ERROR']);

export const paymentCurrencyEnum = pgEnum('payment_currency', ['USD', 'CAD', 'EUR']);

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

/* -------------------- Users -------------------- */
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    customerId: integer('customer_id').notNull().unique().references(() => customers.id, {onDelete: 'cascade'}),
    email: text('email').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    isActive: boolean('is_active').default(true),
});

/* -------------------- Orders -------------------- */
export const orders = pgTable('orders', {
    id: serial('id').primaryKey(),
    customerId: integer('customer_id').notNull().references(() => customers.id, {onDelete: 'cascade'}),
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
    orderId: integer('order_id').notNull().references(() => orders.id, {onDelete: 'cascade'}),
    productVariantId: integer('product_variant_id').notNull().references(() => productVariants.id, {onDelete: 'cascade'}),
    quantity: integer('quantity').notNull(),
    unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
    discount: numeric('discount', { precision: 10, scale: 2 })
});

/* -------------------- Addresses -------------------- */
export const addresses = pgTable('addresses', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, {onDelete: 'cascade'}),
    streetAddress: text('street_address').notNull(),
    city: text('city').notNull(),
    state: text('state').notNull(),
    zipCode: text('zip_code').notNull(),
    country: text('country').notNull(),
    isDefault: boolean('is_default').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

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
});

/* -------------------- ProductVariants -------------------- */
export const productVariants = pgTable('product_variants', {
    id: serial('id').primaryKey(),
    sku: uuid('sku').notNull().unique(),
    size: text('size').notNull(),
    flavor: text('flavor'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    imagePath: text('image_path').unique(),
    productId: integer('product_id').notNull().references(() => products.id, {onDelete: 'cascade'}),
});

/* -------------------- Inventory -------------------- */
export const inventory = pgTable('inventory', {
    id: serial('id').primaryKey(),
    productVariantId: integer('product_variant_id').notNull().references(() => productVariants.id, {onDelete: 'cascade'}),
    locationId: integer('location_id').notNull().references(() => locations.id, {onDelete: 'cascade'}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    quantity: integer('quantity').notNull().default(0),
}, (table) => ({
    uniqueInventory: unique().on(table.productVariantId, table.locationId)
}));

/* -------------------- Location -------------------- */
export const locations = pgTable('locations', {
    id: serial('id').primaryKey(),
    storeNumber: integer('store_number').notNull().unique(),
    storeAddress: jsonb('store_address').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/* -------------------- Discounts -------------------- */
export const discounts = pgTable('discounts', {
    id: serial('id').primaryKey(),
    code: text('code').unique().notNull(),
    value: numeric('value', { precision: 10, scale: 2 }).notNull(),
    description: text('description').notNull(),
    type: discountTypesEnum().notNull(),
    isActive: boolean('is_active').notNull(),
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usageLimit: integer('usage_limit'),
    timesUsed: integer('times_used').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(), 
});

/* -------------------- OrderDiscounts -------------------- */
export const orderDiscounts = pgTable('order_discounts', {
    id: serial('id').primaryKey(),
    orderId: integer('order_id').notNull().references(() => orders.id),
    discountId: integer('discount_id').notNull().references(() => discounts.id)
});

/* -------------------- Payments -------------------- */
export const payments = pgTable('payments', {
    id: serial('id').primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    orderId: integer('order_id').notNull().references(() => orders.id),
    paymentMethod: paymentMethodsEnum().notNull().default('CARD'),
    status: paymentStatusEnum().notNull().default('PENDING'),
    currency: paymentCurrencyEnum().notNull(),
    paymentIntentId: text('stripe_payment_intent_id').unique()
});

/* -------------------- Relations -------------------- */
export const usersRelations = relations(users, ({ one, many }) => ({
    customer: one(customers, {
        fields: [users.customerId],
        references: [customers.id],
    }),
    addresses: many(addresses),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
    user: one(users, {
        fields: [customers.id],
        references: [users.customerId]
    }),
    orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
    customer: one(customers, {
        fields: [orders.customerId],
        references: [customers.id],
    }),
    orderItems: many(orderItems),
    orderDiscounts: many(orderDiscounts),
    payments: many(payments),
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

export const locationsRelations = relations(locations, ({ many }) => ({
    inventory: many(inventory)
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
    productVariant: one(productVariants, {
        fields: [inventory.productVariantId],
        references: [productVariants.id]
    }),
    location: one(locations, {
        fields: [inventory.locationId],
        references: [locations.id]
    })
}));

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

export const orderDiscountsRelations = relations(orderDiscounts, ({ one }) => ({
    order: one(orders, {
        fields: [orderDiscounts.orderId],
        references: [orders.id]
    }),
    discount: one(discounts, {
        fields: [orderDiscounts.discountId],
        references: [discounts.id]
    })
}));

export const discountsRelations = relations(discounts, ({ many }) => ({
    orderDiscounts: many(orderDiscounts),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
    order: one(orders, {
        fields: [payments.orderId],
        references: [orders.id]
    })
}));