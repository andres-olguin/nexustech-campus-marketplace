import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1794268800000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
      CREATE TABLE users (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), "createdAt" timestamptz NOT NULL DEFAULT now(), email varchar NOT NULL UNIQUE, "passwordHash" varchar NOT NULL, name varchar NOT NULL);
      CREATE UNIQUE INDEX users_email_normalized ON users (lower(email));
      CREATE TABLE buyer_profiles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), "createdAt" timestamptz NOT NULL DEFAULT now(), "userId" uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE);
      CREATE TABLE seller_profiles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), "createdAt" timestamptz NOT NULL DEFAULT now(), "userId" uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE, "displayName" varchar NOT NULL);
      CREATE TABLE categories (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), "createdAt" timestamptz NOT NULL DEFAULT now(), name varchar NOT NULL UNIQUE, "ownerId" uuid NOT NULL REFERENCES users(id));
      CREATE UNIQUE INDEX categories_name_normalized ON categories (lower(name));
      CREATE TABLE products (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now(), name varchar NOT NULL, description text NOT NULL, "categoryId" uuid NOT NULL REFERENCES categories(id), "sellerId" uuid NOT NULL REFERENCES seller_profiles("userId"), price integer NOT NULL CHECK(price BETWEEN 1000 AND 2500000), stock integer NOT NULL CHECK(stock BETWEEN 0 AND 100000), "imageUrl" text, "isActive" boolean NOT NULL DEFAULT true);
      CREATE INDEX products_catalog ON products ("isActive", "categoryId", "createdAt");
      CREATE INDEX products_seller ON products ("sellerId");
      CREATE TABLE cart_items (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), "createdAt" timestamptz NOT NULL DEFAULT now(), "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, "productId" uuid NOT NULL REFERENCES products(id), quantity integer NOT NULL CHECK(quantity BETWEEN 1 AND 100), UNIQUE("userId", "productId"));
      CREATE TABLE favorites (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), "createdAt" timestamptz NOT NULL DEFAULT now(), "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, "productId" uuid NOT NULL REFERENCES products(id), UNIQUE("userId", "productId"));
      CREATE TABLE orders (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), "createdAt" timestamptz NOT NULL DEFAULT now(), "userId" uuid NOT NULL REFERENCES users(id), status varchar NOT NULL DEFAULT 'confirmed' CHECK(status IN ('confirmed','cancelled')), total bigint NOT NULL CHECK(total > 0), "shippingAddress" text NOT NULL, "idempotencyKey" varchar NOT NULL, UNIQUE("userId", "idempotencyKey"));
      CREATE INDEX orders_user_date ON orders ("userId", "createdAt");
      CREATE TABLE order_items (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), "createdAt" timestamptz NOT NULL DEFAULT now(), "orderId" uuid NOT NULL REFERENCES orders(id), "productId" uuid NOT NULL REFERENCES products(id), name varchar NOT NULL, "unitPrice" integer NOT NULL CHECK("unitPrice" BETWEEN 1000 AND 2500000), quantity integer NOT NULL CHECK(quantity BETWEEN 1 AND 100));
      CREATE INDEX order_items_order ON order_items ("orderId");
      CREATE TABLE simulated_transactions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), "createdAt" timestamptz NOT NULL DEFAULT now(), "orderId" uuid NOT NULL UNIQUE REFERENCES orders(id), status varchar NOT NULL DEFAULT 'approved' CHECK(status IN ('approved','reversed')), provider varchar NOT NULL DEFAULT 'simulation' CHECK(provider = 'simulation'), amount bigint NOT NULL CHECK(amount > 0));
    `);
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query('DROP TABLE simulated_transactions, order_items, orders, favorites, cart_items, products, categories, seller_profiles, buyer_profiles, users');
  }
}
