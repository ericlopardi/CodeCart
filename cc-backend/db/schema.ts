import { pgTable, serial, text, timestamp, boolean, integer, numeric, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/* -------------------- Users -------------------- */
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    customerId: integer('customer_id').unique().references(() => customers.id, {onDelete: 'cascade'}),
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
    customerId: integer('customer_id').notNull().references(() => customers.id, {onDelete: 'cascade'}),
    status: text('status').notNull(),
    totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
    deliveryAddress: jsonb('delivery_address'),
    createdAt: timestamp('created_at', { withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/* -------------------- Addresses -------------------- */
export const addresses = pgTable('addresses', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, {onDelete: 'cascade'}),
    streetAddress: text('street_address'),
    city: text('city').notNull(),
    state: text('state').notNull(),
    zipCode: text('zip_code').notNull(),
    country: text('country').notNull(),
    isDefault: boolean('is_default').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true}).notNull().defaultNow(),
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
    user: one(users),
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