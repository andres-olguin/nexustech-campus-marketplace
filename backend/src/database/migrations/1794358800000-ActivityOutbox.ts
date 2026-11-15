import { MigrationInterface, QueryRunner } from 'typeorm';
export class ActivityOutbox1794358800000 implements MigrationInterface {
  async up(q: QueryRunner) {
    await q.query(`CREATE TABLE activity_outbox (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), "createdAt" timestamptz NOT NULL DEFAULT now(), "eventName" varchar NOT NULL, "userId" uuid NOT NULL, "resourceId" uuid NOT NULL, metadata jsonb NOT NULL DEFAULT '{}')`);
    await q.query('CREATE INDEX activity_outbox_created ON activity_outbox ("createdAt")');
  }
  async down(q: QueryRunner) { await q.query('DROP TABLE activity_outbox'); }
}
