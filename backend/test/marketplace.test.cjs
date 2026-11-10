const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const { mkdtemp, rm, mkdir, writeFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join, resolve, sep, dirname } = require('node:path');
const { execFile, spawn } = require('node:child_process');
const { once } = require('node:events');
const { promisify } = require('node:util');
const exec = promisify(execFile);
const request = require('supertest');

async function freePort() {
  const server = require('node:net').createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}

test('Marketplace HTTP against real isolated PostgreSQL', { timeout: 600000 }, async t => {
  const { default: EmbeddedPostgres } = await import('embedded-postgres');
  const password = randomBytes(24).toString('hex');
  const dir = await mkdtemp(join(tmpdir(), 'nexustech-pg-'));
  const pgPort = await freePort();
  const apiPort = await freePort();
  const pg = new EmbeddedPostgres({ databaseDir: dir, port: pgPort, user: 'postgres', password,
    persistent: true, initdbFlags: ['--locale=C', '--encoding=UTF8'],
    // PostgreSQL 18 io workers may retain inherited pipes after taskkill on Windows.
    postgresFlags: ['-c', 'io_method=sync'], onLog: () => {}, onError: () => {} });
  let db, app;
  const stopPostgres = async () => {
    const owned = pg.process;
    if (!owned) return;
    if (owned.exitCode === null) {
      const ctl = join(dirname(owned.spawnfile), process.platform === 'win32' ? 'pg_ctl.exe' : 'pg_ctl');
      await exec(ctl, ['-D', dir, '-m', 'fast', '-w', '-t', '30', 'stop'], { timeout: 45000 });
      if (owned.exitCode === null) await once(owned, 'exit');
    }
    pg.process = undefined;
  };
  try {
    await pg.initialise();
    await pg.start();
    await pg.createDatabase('nexustech_test');
    process.env.DATABASE_URL = `postgresql://postgres:${password}@localhost:${pgPort}/nexustech_test`;
    process.env.JWT_SECRET = randomBytes(48).toString('hex');
    if (process.env.MONGODB_TEST_URI) process.env.MONGODB_URI = process.env.MONGODB_TEST_URI;
    require('reflect-metadata');
    const { default: database } = require('../dist/database/data-source');
    db = database;
    await db.initialize();
    console.log('Verified database:', (await db.query('SELECT version()'))[0].version);
    await t.test('Production and TypeScript migration CLIs: up, down and up', async () => {
      const cli = require.resolve('typeorm/cli.js');
      await exec(process.execPath, [cli, 'migration:run', '-d', 'dist/database/data-source.js']);
      assert.equal((await db.runMigrations()).length, 0);
      await exec(process.execPath, [cli, 'migration:revert', '-d', 'dist/database/data-source.js']);
      await exec(process.execPath, [cli, 'migration:revert', '-d', 'dist/database/data-source.js']);
      await exec(process.execPath, [cli, 'migration:revert', '-d', 'dist/database/data-source.js']);
      await exec(process.execPath, ['-r', 'ts-node/register', cli, 'migration:run', '-d', 'src/database/data-source.ts']);
      assert.equal((await db.runMigrations()).length, 0);
    });
    const { NestFactory } = require('@nestjs/core');
    const { AppModule } = require('../dist/app.module');
    const { configureApp } = require('../dist/bootstrap');
    app = await NestFactory.create(AppModule, { logger: false });
    const openapi = configureApp(app);
    await app.init();
    const http = request(app.getHttpServer());
    const base = '/api/v1';
    const auth = token => ({ Authorization: `Bearer ${token}` });
    const register = async (email, name) => (await http.post(`${base}/auth/register`).send({ email, name, password: 'Demo-password-2026!' }).expect(201)).body;
    let seller, buyer, other, category, product, order;
    const examples = [];
    await t.test('All activity endpoints require authentication', async () => {
      for (const route of ['interactions/me', 'interactions/target/11111111-1111-4111-8111-111111111111', 'logs/me', 'logs/resource/11111111-1111-4111-8111-111111111111']) {
        await http.get(base + '/activity/' + route).expect(401);
      }
      await http.post(base + '/activity/interactions').send({}).expect(401);
    });
    await t.test('Health checks SQL and Swagger exposes contract', async () => {
      assert.equal((await http.get(`${base}/health`).expect(200)).body.database, 'up');
      await http.get('/docs-json').expect(200);
      assert.ok(openapi.paths[`${base}/orders`].post);
      assert.ok(openapi.components.schemas.ProductDto.properties.stock);
      assert.ok(openapi.components.schemas.Order.properties.transactions);
      assert.ok(openapi.components.schemas.Order.properties.fulfillments);
      assert.ok(openapi.paths[`${base}/seller/orders/{id}/status`].patch);
      assert.equal(openapi.paths[`${base}/orders`].post.responses['201'].content['application/json'].schema.$ref, '#/components/schemas/Order');
    });
    await t.test('Input validation, unknown fields and protected routes', async () => {
      await http.post(`${base}/auth/register`).send({ email: 'bad', password: 'short', name: 'x', admin: true }).expect(400);
      await http.get(`${base}/users/me`).expect(401);
      await http.get(`${base}/users/me`).set('x-user-id', 'usr-demo').expect(401);
      await http.get(`${base}/products/not-uuid`).expect(400);
      const invalid = await http.get(`${base}/products?limit=101`).expect(400);
      examples.push({ method: 'GET', path: `${base}/products?limit=101`, status: invalid.status, response: invalid.body });
      await http.get(`${base}/products?minPrice=2000&maxPrice=1000`).expect(400);
    });
    await t.test('Registration, login, profiles, duplicate email, no password disclosure', async () => {
      seller = await register('seller@example.test', 'Seller Demo');
      buyer = await register('buyer@example.test', 'Buyer Demo');
      other = await register('other@example.test', 'Other Demo');
      await http.post(`${base}/auth/register`).send({ email: 'SELLER@example.test', password: 'Demo-password-2026!', name: 'Duplicate' }).expect(409);
      await http.post(`${base}/auth/login`).send({ email: 'seller@example.test', password: 'incorrect' }).expect(401);
      await http.post(`${base}/auth/login`).send({ email: 'seller@example.test', password: 'Demo-password-2026!' }).expect(200);
      const profile = (await http.patch(`${base}/users/me`).set(auth(seller.accessToken)).send({ sellerName: 'Campus Seller' }).expect(200)).body;
      assert.equal(profile.sellerProfile.displayName, 'Campus Seller');
      assert.ok(profile.buyerProfile.id);
      assert.equal(JSON.stringify(profile).includes('password'), false);
    });
    await t.test('Category/product CRUD, ownership and FK constraints', async () => {
      category = (await http.post(`${base}/categories`).set(auth(seller.accessToken)).send({ name: 'Hardware' }).expect(201)).body;
      examples.push({ method: 'POST', path: `${base}/categories`, status: 201, request: { name: 'Hardware' }, response: category });
      await http.patch(`${base}/categories/${category.id}`).set(auth(buyer.accessToken)).send({ name: 'Stolen' }).expect(403);
      product = (await http.post(`${base}/products`).set(auth(seller.accessToken)).send({ name: 'Teclado campus', description: 'Teclado mecánico usado en buen estado', categoryId: category.id, price: 65000, stock: 3 }).expect(201)).body;
      examples.push({ method: 'POST', path: `${base}/products`, status: 201, request: { name: product.name, description: product.description, categoryId: product.categoryId, price: product.price, stock: product.stock }, response: product });
      await http.patch(`${base}/products/${product.id}`).set(auth(buyer.accessToken)).send({ price: 1000 }).expect(403);
      await http.patch(`${base}/products/${product.id}`).set(auth(seller.accessToken)).send({ price: -1 }).expect(400);
      await http.patch(`${base}/products/${product.id}`).set(auth(seller.accessToken)).send({ price: null }).expect(400);
      await http.delete(`${base}/categories/${category.id}`).set(auth(seller.accessToken)).expect(409);
      const page = (await http.get(`${base}/publications?search=teclado&categoryId=${category.id}&minPrice=60000&maxPrice=70000`).expect(200)).body;
      assert.equal(page.total, 1);
      assert.equal(page.items[0].id, product.id);
    });
    await t.test('Favorites are idempotent and scoped per user', async () => {
      for (let i = 0; i < 2; i++) await http.put(`${base}/favorites/${product.id}`).set(auth(buyer.accessToken)).expect(200);
      assert.equal((await http.get(`${base}/favorites`).set(auth(buyer.accessToken)).expect(200)).body.total, 1);
      assert.equal((await http.get(`${base}/favorites`).set(auth(other.accessToken)).expect(200)).body.total, 0);
    });
    await t.test('Cart rejects own product, excess stock and invalid quantity', async () => {
      await http.put(`${base}/cart`).set(auth(seller.accessToken)).send({ productId: product.id, quantity: 1 }).expect(409);
      await http.put(`${base}/cart`).set(auth(buyer.accessToken)).send({ productId: product.id, quantity: 4 }).expect(409);
      await http.put(`${base}/cart`).set(auth(buyer.accessToken)).send({ productId: product.id, quantity: 0 }).expect(400);
      await http.put(`${base}/cart`).set(auth(buyer.accessToken)).send({ productId: product.id, quantity: 2 }).expect(200);
      assert.equal((await http.get(`${base}/cart`).set(auth(buyer.accessToken)).expect(200)).body.total, 130000);
    });
    await t.test('Concurrent idempotent checkout creates one order and decrements once', async () => {
      const body = { shippingAddress: 'Retiro campus Viña del Mar', idempotencyKey: 'checkout-test-001' };
      const results = await Promise.all([1, 2].map(() => http.post(`${base}/orders`).set(auth(buyer.accessToken)).send(body).expect(201)));
      order = results[0].body;
      examples.push({ method: 'POST', path: `${base}/orders`, status: 201, request: body, response: order });
      assert.equal(order.id, results[1].body.id);
      assert.equal(order.total, 130000);
      assert.equal(order.transactions[0].provider, 'simulation');
      assert.equal(order.items[0].unitPrice, 65000);
      assert.equal((await http.get(`${base}/products/${product.id}`)).body.stock, 1);
      assert.equal((await http.get(`${base}/cart`).set(auth(buyer.accessToken))).body.items.length, 0);
      await http.get(`${base}/orders/${order.id}`).set(auth(other.accessToken)).expect(404);
      await http.post(`${base}/orders`).set(auth(buyer.accessToken)).send({ ...body, shippingAddress: 'Otra dirección de retiro' }).expect(409);
    });
    await t.test('Two buyers racing for last unit cannot oversell', async () => {
      await http.put(`${base}/cart`).set(auth(buyer.accessToken)).send({ productId: product.id, quantity: 1 }).expect(200);
      await http.put(`${base}/cart`).set(auth(other.accessToken)).send({ productId: product.id, quantity: 1 }).expect(200);
      const results = await Promise.all([buyer, other].map(user => http.post(`${base}/orders`).set(auth(user.accessToken)).send({ shippingAddress: 'Retiro campus principal', idempotencyKey: 'race-last-unit' })));
      assert.deepEqual(results.map(r => r.status).sort(), [201, 409]);
      assert.equal((await http.get(`${base}/products/${product.id}`)).body.stock, 0);
      const loser = results[0].status === 409 ? buyer : other;
      assert.equal((await http.get(`${base}/cart`).set(auth(loser.accessToken))).body.items.length, 1);
      assert.equal((await db.query('SELECT count(*)::int AS n FROM orders WHERE "idempotencyKey" = $1', ['race-last-unit']))[0].n, 1);
    });
    await t.test('Cancellation restores stock once and reverses simulation', async () => {
      const results = await Promise.all([1, 2].map(() => http.patch(`${base}/orders/${order.id}/status`).set(auth(buyer.accessToken)).send({ status: 'cancelled' })));
      assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
      assert.equal((await http.get(`${base}/products/${product.id}`)).body.stock, 2);
      const cancelled = (await http.get(`${base}/orders/${order.id}`).set(auth(buyer.accessToken))).body;
      assert.equal(cancelled.status, 'cancelled');
      assert.equal(cancelled.transactions[0].status, 'reversed');
      assert.ok(cancelled.fulfillments.every(f => f.status === 'cancelled'));
      await http.patch(`${base}/orders/${order.id}/status`).set(auth(buyer.accessToken)).send({ status: 'paid' }).expect(400);
    });
    await t.test('Failed multi-item checkout rolls back inventory, order and cart', async () => {
      // Race loser still has one item. Make its quantity exceed the remaining stock.
      const rows = await db.query('SELECT "userId" FROM cart_items WHERE "productId" = $1', [product.id]);
      const loser = rows[0].userId === buyer.user.id ? buyer : other;
      const extra = (await http.post(`${base}/products`).set(auth(seller.accessToken)).send({ name: 'Mouse campus', description: 'Mouse de laboratorio en buen estado', categoryId: category.id, price: 12000, stock: 2 }).expect(201)).body;
      await http.put(`${base}/cart`).set(auth(loser.accessToken)).send({ productId: extra.id, quantity: 2 }).expect(200);
      await db.query('UPDATE products SET stock = 0 WHERE id = $1', [product.id]);
      await http.post(`${base}/orders`).set(auth(loser.accessToken)).send({ shippingAddress: 'Retiro campus principal', idempotencyKey: 'rollback-multiple' }).expect(409);
      assert.equal((await http.get(`${base}/products/${extra.id}`)).body.stock, 2);
      assert.equal((await http.get(`${base}/cart`).set(auth(loser.accessToken))).body.items.length, 2);
      assert.equal((await db.query('SELECT count(*)::int AS n FROM orders WHERE "idempotencyKey" = $1', ['rollback-multiple']))[0].n, 0);
      await http.delete(`${base}/products/${extra.id}`).set(auth(seller.accessToken)).expect(200);
    });
    await t.test('Archiving preserves order snapshots and excludes public catalog', async () => {
      await http.delete(`${base}/products/${product.id}`).set(auth(seller.accessToken)).expect(200);
      await http.get(`${base}/products/${product.id}`).expect(404);
      assert.equal((await http.get(`${base}/products`)).body.total, 0);
      assert.equal((await http.get(`${base}/orders/${order.id}`).set(auth(buyer.accessToken))).body.items[0].name, 'Teclado campus');
    });
    await t.test('JWT tampering/expiry and login rate limit are enforced', async () => {
      const { JwtService } = require('@nestjs/jwt');
      const jwt = app.get(JwtService);
      const expired = await jwt.signAsync({ sub: buyer.user.id }, { expiresIn: -1 });
      await http.get(`${base}/users/me`).set(auth(expired)).expect(401);
      await http.get(`${base}/users/me`).set(auth(buyer.accessToken + 'tampered')).expect(401);
      const responses = [];
      for (let i = 0; i < 10; i++) responses.push((await http.post(`${base}/auth/login`).send({ email: 'missing@example.test', password: 'incorrect' })).status);
      assert.ok(responses.includes(429));
    });
    await t.test('Multi-seller tracking authorizes only participants, redacts other sellers and follows strict sequence', async () => {
      for (const item of (await http.get(`${base}/cart`).set(auth(buyer.accessToken))).body.items) {
        await http.delete(`${base}/cart/${item.productId}`).set(auth(buyer.accessToken)).expect(200);
      }
      const create = async (user, name) => (await http.post(`${base}/products`).set(auth(user.accessToken)).send({ name, description: 'Producto sintético para seguimiento académico', categoryId: category.id, price: 15000, stock: 3 }).expect(201)).body;
      const first = await create(seller, 'Monitor seguimiento');
      const second = await create(other, 'Teclado seguimiento');
      for (const p of [first, second]) await http.put(`${base}/cart`).set(auth(buyer.accessToken)).send({ productId: p.id, quantity: 1 }).expect(200);
      const tracked = (await http.post(`${base}/orders`).set(auth(buyer.accessToken)).send({ shippingAddress: 'Retiro sintético campus principal', idempotencyKey: 'multi-seller-tracking' }).expect(201)).body;
      assert.equal(tracked.fulfillments.length, 2);
      const mine = (await http.get(`${base}/seller/orders`).set(auth(seller.accessToken)).expect(200)).body.items.find(o => o.id === tracked.id);
      assert.equal(mine.items.length, 1);
      assert.equal(mine.items[0].sellerId, seller.user.id);
      assert.equal(mine.subtotal, 15000);
      for (const field of ['userId', 'total', 'transactions', 'idempotencyKey', 'fulfillments']) assert.equal(field in mine, false);
      const move = (user, status) => http.patch(`${base}/seller/orders/${tracked.id}/status`).set(auth(user.accessToken)).send({ status });
      await move(buyer, 'preparing').expect(404);
      await http.patch(`${base}/orders/${tracked.id}/status`).set(auth(buyer.accessToken)).send({ status: 'shipped' }).expect(400);
      await move(seller, 'shipped').expect(409);

        const concurrent = await Promise.all([move(seller, 'preparing'), move(seller, 'preparing')]);
        assert.deepEqual(concurrent.map(r => r.status).sort(), [200, 409]);
        assert.equal((await http.get(`${base}/orders/${tracked.id}`).set(auth(buyer.accessToken))).body.status, 'confirmed');
        // Global status is still confirmed; segment state must nevertheless block cancellation.
        await http.patch(`${base}/orders/${tracked.id}/status`).set(auth(buyer.accessToken)).send({ status: 'cancelled' }).expect(409);
        await move(other, 'preparing').expect(200);
        assert.equal((await http.get(`${base}/orders/${tracked.id}`).set(auth(buyer.accessToken))).body.status, 'preparing');
        await move(seller, 'confirmed').expect(400);
        await move(seller, 'shipped').expect(200);
        await move(seller, 'delivered').expect(200);
        await move(other, 'shipped').expect(200);
        assert.equal((await http.get(`${base}/orders/${tracked.id}`).set(auth(buyer.accessToken))).body.status, 'shipped');
        await move(other, 'delivered').expect(200);
        const delivered = (await http.get(`${base}/orders/${tracked.id}`).set(auth(buyer.accessToken))).body;
        assert.equal(delivered.status, 'delivered');
        assert.ok(delivered.fulfillments.every(f => f.status === 'delivered'));
        assert.equal(delivered.transactions[0].status, 'approved');

        for (const p of [first, second]) assert.equal((await http.get(`${base}/products/${p.id}`)).body.stock, 2);
        await move(seller, 'delivered').expect(409);

    });
    await t.test('Cancellation racing seller preparation cannot both succeed', async () => {
      const p = (await http.post(`${base}/products`).set(auth(seller.accessToken)).send({ name: 'Producto carrera despacho', description: 'Producto sintético sin datos personales', categoryId: category.id, price: 20000, stock: 3 }).expect(201)).body;
      await http.put(`${base}/cart`).set(auth(buyer.accessToken)).send({ productId: p.id, quantity: 1 }).expect(200);
      const o = (await http.post(`${base}/orders`).set(auth(buyer.accessToken)).send({ shippingAddress: 'Retiro sintético campus principal', idempotencyKey: 'cancel-vs-preparing' }).expect(201)).body;
      const results = await Promise.all([
        http.patch(`${base}/orders/${o.id}/status`).set(auth(buyer.accessToken)).send({ status: 'cancelled' }),
        http.patch(`${base}/seller/orders/${o.id}/status`).set(auth(seller.accessToken)).send({ status: 'preparing' }),
      ]);
      assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
      const current = (await http.get(`${base}/orders/${o.id}`).set(auth(buyer.accessToken))).body;
      assert.equal((await http.get(`${base}/products/${p.id}`)).body.stock, current.status === 'cancelled' ? 3 : 2);
      assert.equal(current.transactions[0].status, current.status === 'cancelled' ? 'reversed' : 'approved');
    });
    await t.test('Durable SQL outbox and real MongoDB privacy/retry', { skip: !process.env.MONGODB_TEST_URI }, async () => {
      const { ActivityService } = require('../dist/activity/activity.service');
      const activity = app.get(ActivityService);
      const { ActivityOutbox } = require('../dist/database/entities');
      const { MongoClient } = require('mongodb');
      const client = new MongoClient(process.env.MONGODB_TEST_URI);
      await client.connect();
      try {
        const mongo = client.db(process.env.MONGODB_DB_NAME || 'nexustech');
        await activity.flushOutbox();
        assert.equal(await db.getRepository(ActivityOutbox).count(), 0);
        const logs = await mongo.collection('activity_logs').find({}).toArray();
        for (const name of ['product.created', 'product.updated', 'order.created', 'order.cancelled', 'order.fulfillment.updated']) assert.ok(logs.some(l => l.eventName === name), name);
        const productRow = await db.getRepository(require('../dist/database/entities').Product).findOneByOrFail({ id: product.id });
        const body = { targetId: product.id, targetType: 'product', receiverId: productRow.sellerId, message: 'Mensaje privado persistente' };
        const sent = (await http.post(base + '/activity/interactions').set(auth(buyer.accessToken)).send(body).expect(201)).body;
        assert.ok(sent._id);
        assert.ok(await mongo.collection('interactions').findOne({ message: body.message, senderId: buyer.user.id }));
        const reader = new ActivityService(db);
        await reader.onModuleInit();
        try { assert.ok((await reader.getInteractionsByUser(buyer.user.id)).some(m => m.message === body.message)); }
        finally { await reader.onModuleDestroy(); }
        const mine = (await http.get(base + '/activity/interactions/target/' + product.id).set(auth(buyer.accessToken)).expect(200)).body;
        assert.ok(mine.some(m => m.message === body.message));
        const unrelated = (await http.get(base + '/activity/interactions/target/' + product.id).set(auth(other.accessToken)).expect(200)).body;
        assert.equal(unrelated.length, 0);
        const otherLogs = (await http.get(base + '/activity/logs/resource/' + product.id).set(auth(other.accessToken)).expect(200)).body;
        assert.ok(otherLogs.every(l => l.userId === other.user.id));
        await http.post(base + '/activity/interactions').set(auth(buyer.accessToken)).send({ ...body, receiverId: other.user.id }).expect(403);
        await http.post(base + '/activity/interactions').set(auth(buyer.accessToken)).send({ ...body, message: '   ' }).expect(400);
        await http.get(base + '/activity/interactions/me?limit=101').set(auth(buyer.accessToken)).expect(400);
        // Simulate crash after Mongo upsert but before SQL delete, then replay.
        const event = await db.getRepository(ActivityOutbox).save({ eventName: 'product.updated', userId: buyer.user.id, resourceId: product.id, metadata: {} });
        await mongo.collection('activity_logs').insertOne({ eventId: event.id, eventName: event.eventName, userId: event.userId, resourceId: event.resourceId, occurredAt: event.createdAt.toISOString(), metadata: {} });
        await activity.flushOutbox();
        assert.equal(await mongo.collection('activity_logs').countDocuments({ eventId: event.id }), 1);
        assert.equal(await db.getRepository(ActivityOutbox).count(), 0);
        await activity.client.close();
        await http.get(base + '/activity/interactions/me').set(auth(buyer.accessToken)).expect(503);
        await http.get(base + '/activity/logs/me').set(auth(buyer.accessToken)).expect(503);
        await http.post(base + '/activity/interactions').set(auth(buyer.accessToken)).send(body).expect(503);
        const queued = (await http.post(base + '/products').set(auth(seller.accessToken)).send({ name: 'Outbox recovery', description: 'Real database recovery scenario', categoryId: category.id, price: 12000, stock: 2 }).expect(201)).body;
        assert.ok(await db.getRepository(ActivityOutbox).existsBy({ resourceId: queued.id }));
        await activity.connect();
        await activity.flushOutbox();
        assert.ok(await mongo.collection('activity_logs').findOne({ resourceId: queued.id, eventName: 'product.created' }));
        await http.get(base + '/health/ready').expect(200);
      } finally { await client.close(); }
    });
    await t.test('Data survives PostgreSQL restart and two fresh API processes', async () => {
      const trackedId = (await db.query('SELECT id FROM orders WHERE "idempotencyKey" = $1', ['multi-seller-tracking']))[0].id;
      await app.close(); app = undefined;
      await db.destroy();
      await stopPostgres();
      await pg.start();
      for (let restart = 0; restart < 2; restart++) {
        const child = spawn(process.execPath, ['dist/main.js'], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, PORT: String(apiPort) } });
        let diagnostics = '';
        child.stdout.on('data', data => { diagnostics = (diagnostics + data).slice(-12000); });
        child.stderr.on('data', data => { diagnostics = (diagnostics + data).slice(-12000); });
        try {
          const live = request(`http://127.0.0.1:${apiPort}`);
          let ready = false;
          for (let attempt = 0; attempt < 480; attempt++) {
            if (child.exitCode !== null) throw new Error('API process exited before readiness: ' + diagnostics);
            try { ready = (await live.get(`${base}/health`).timeout(500)).status === 200; } catch {}
            if (ready) break;
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          assert.ok(ready, 'Fresh API process must become ready: ' + diagnostics);
          const session = (await live.post(`${base}/auth/login`).send({ email: 'buyer@example.test', password: 'Demo-password-2026!' }).expect(200)).body;
          const saved = (await live.get(`${base}/orders/${trackedId}`).set(auth(session.accessToken)).expect(200)).body;
          assert.equal(saved.status, 'delivered');
          assert.equal(saved.total, 30000);
          assert.equal(saved.fulfillments.length, 2);
          for (const item of saved.items) assert.equal((await live.get(`${base}/products/${item.productId}`).expect(200)).body.stock, 2);
          await live.get('/docs').redirects(1).expect(200);
        } catch (error) { console.error('Restart verification failed:', error, diagnostics); throw error; } finally {
          if (child.exitCode === null) { const ended = once(child, 'exit'); child.kill(); await ended; }
        }
      }
    });
    if (process.env.NEXUSTECH_CAPTURE_EXAMPLES === '1') {
      await mkdir('docs', { recursive: true });
      await writeFile('docs/HTTP_EXAMPLES.json', JSON.stringify({ capturedAt: new Date().toISOString(),
        provenance: 'Real HTTP responses from isolated PostgreSQL integration tests; synthetic data; IDs do not exist in deployment; no tokens/passwords included.', examples }, null, 2) + '\n');
    }
  } finally {
    if (app) await app.close();
    if (db?.isInitialized) await db.destroy();
    await stopPostgres();
    const target = resolve(dir);
    assert.ok(target.startsWith(resolve(tmpdir()) + sep + 'nexustech-pg-'), 'Only remove the isolated mkdtemp cluster');
    await rm(target, { recursive: true, force: true });
  }
});
