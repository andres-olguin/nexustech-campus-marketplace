import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrderFulfillments1794272400000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`
      ALTER TABLE orders DROP CONSTRAINT orders_status_check;
      ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK(status IN ('confirmed','preparing','shipped','delivered','cancelled'));
      ALTER TABLE order_items ADD COLUMN "sellerId" uuid REFERENCES seller_profiles("userId");
      UPDATE order_items i SET "sellerId" = p."sellerId" FROM products p WHERE i."productId" = p.id;
      ALTER TABLE order_items ALTER COLUMN "sellerId" SET NOT NULL;
      CREATE TABLE order_fulfillments (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "orderId" uuid NOT NULL REFERENCES orders(id),
        "sellerId" uuid NOT NULL REFERENCES seller_profiles("userId"),
        status varchar NOT NULL DEFAULT 'confirmed' CHECK(status IN ('confirmed','preparing','shipped','delivered','cancelled')),
        UNIQUE("orderId","sellerId")
      );
      CREATE INDEX fulfillment_seller_date ON order_fulfillments ("sellerId", "createdAt");
      INSERT INTO order_fulfillments ("orderId", "sellerId", status)
        SELECT DISTINCT i."orderId", i."sellerId", o.status FROM order_items i JOIN orders o ON o.id = i."orderId";
    `);
  }
  async down(q: QueryRunner): Promise<void> {
    // Do not silently erase tracking already used in a demonstration/shared database.
    await q.query(`DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM order_fulfillments WHERE status NOT IN ('confirmed','cancelled')) THEN
        RAISE EXCEPTION 'Cannot revert: fulfillment tracking has progressed';
      END IF;
    END $$`);
    await q.query(`DROP TABLE order_fulfillments;
      ALTER TABLE order_items DROP COLUMN "sellerId";
      ALTER TABLE orders DROP CONSTRAINT orders_status_check;
      ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK(status IN ('confirmed','cancelled'));`);
  }
}
