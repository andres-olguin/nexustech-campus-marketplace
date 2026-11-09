import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { entities } from './entities';
import { InitialSchema1794268800000 } from './migrations/1794268800000-InitialSchema';
import { OrderFulfillments1794272400000 } from './migrations/1794272400000-OrderFulfillments';

const database = new DataSource({
  type: 'postgres', url: process.env.DATABASE_URL,
  host: process.env.DATABASE_HOST || 'localhost', port: Number(process.env.DATABASE_PORT || 5432),
  username: process.env.DATABASE_USER || 'nexustech', password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || 'nexustech',
  entities, migrations: [InitialSchema1794268800000, OrderFulfillments1794272400000], synchronize: false,
  migrationsRun: false, logging: false,
});
export default database;
