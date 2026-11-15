import { MigrationInterface, QueryRunner } from 'typeorm';

export class CatalogTechnical1794362400000 implements MigrationInterface {
  async up(q: QueryRunner) {
    await q.query('ALTER TABLE products ADD COLUMN technical jsonb');
    await q.query("CREATE INDEX products_technical_profile ON products ((technical->>'profile')) WHERE \"isActive\" = true");
  }

  async down(q: QueryRunner) {
    await q.query('DROP INDEX products_technical_profile');
    await q.query('ALTER TABLE products DROP COLUMN technical');
  }
}
