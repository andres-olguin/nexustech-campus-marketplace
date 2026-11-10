const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const { writeFileSync } = require('node:fs');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const exec = promisify(execFile);
const base = 'http://127.0.0.1:3001/api/v1';
const project = 'nexustech-hito3-ci';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function dc(args) {
  return (await exec('docker', ['compose', '--project-name', project, '--env-file', '.env.ci', ...args], { timeout: 120000, maxBuffer: 2e6 })).stdout.trim();
}
async function http(path, method = 'GET', body, token, status = 200) {
  const response = await fetch(base + path, { method, signal: AbortSignal.timeout(30000),
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  assert.equal(response.status, status, method + ' ' + path + ': HTTP ' + response.status);
  return response.json();
}
async function until(label, operation) {
  const deadline = Date.now() + 120000;
  let last;
  while (Date.now() < deadline) {
    try { if (await operation()) return; } catch (error) { last = error; }
    await wait(2000);
  }
  throw new Error('Timeout: ' + label, { cause: last });
}
async function healthy() {
  const raw = await dc(['ps', '--format', 'json']);
  const rows = raw.startsWith('[') ? JSON.parse(raw) : raw.split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
  return ['postgres', 'mongo', 'api', 'web'].every(name => rows.some(row => row.Service === name && row.State === 'running' && row.Health === 'healthy'));
}
async function main() {
  if (process.argv[2] === 'prepare') {
    writeFileSync('.env.ci', ['POSTGRES_PASSWORD=' + randomBytes(24).toString('hex'),
      'MONGO_PASSWORD=' + randomBytes(24).toString('hex'), 'JWT_SECRET=' + randomBytes(48).toString('hex'), ''].join('\n'), { flag: 'wx', mode: 0o600 });
    console.log('Ephemeral credentials created without printing them.'); return;
  }
  await until('four healthy services', healthy);
  await http('/health/ready');
  assert.equal((await fetch('http://127.0.0.1:5173', { signal: AbortSignal.timeout(10000) })).status, 200);
  const openapi = await (await fetch('http://127.0.0.1:3001/docs-json')).json();
  assert.ok(openapi.paths['/api/v1/activity/interactions']);
  const run = randomBytes(6).toString('hex'), password = randomBytes(24).toString('hex');
  const register = role => http('/auth/register', 'POST', { name: 'Synthetic ' + role, email: role + '-' + run + '@example.test', password }, undefined, 201);
  const seller = await register('seller'), buyer = await register('buyer'), stranger = await register('stranger');
  const category = await http('/categories', 'POST', { name: 'CI ' + run }, seller.accessToken, 201);
  const product = await http('/products', 'POST', { name: 'CI persistent keyboard', description: 'Synthetic keyboard for real Compose verification', categoryId: category.id, price: 15000, stock: 2 }, seller.accessToken, 201);
  await http('/activity/interactions/me', 'GET', undefined, undefined, 401);
  const message = { targetId: product.id, targetType: 'product', receiverId: seller.user.id, message: 'Synthetic private message ' + run };
  const saved = await http('/activity/interactions', 'POST', message, buyer.accessToken, 201);
  assert.match(saved._id, /^[a-f0-9]{24}$/i);
  assert.deepEqual(await http('/activity/interactions/target/' + product.id, 'GET', undefined, stranger.accessToken), []);
  await http('/activity/interactions', 'POST', { ...message, receiverId: stranger.user.id }, buyer.accessToken, 403);
  await http('/cart', 'PUT', { productId: product.id, quantity: 1 }, buyer.accessToken);
  const checkout = { shippingAddress: 'Synthetic campus pickup for CI', idempotencyKey: 'ci-checkout-' + run };
  const orders = await Promise.all([http('/orders', 'POST', checkout, buyer.accessToken, 201), http('/orders', 'POST', checkout, buyer.accessToken, 201)]);
  assert.equal(orders[0].id, orders[1].id);
  assert.equal((await http('/products/' + product.id)).stock, 1);
  await http('/seller/orders/' + orders[0].id + '/status', 'PATCH', { status: 'preparing' }, seller.accessToken);
  await http('/orders/' + orders[0].id + '/status', 'PATCH', { status: 'cancelled' }, buyer.accessToken, 409);
  await dc(['stop', 'mongo']);
  try {
    await http('/activity/interactions/me', 'GET', undefined, buyer.accessToken, 503);
    await http('/activity/logs/me', 'GET', undefined, buyer.accessToken, 503);
    await http('/activity/interactions', 'POST', message, buyer.accessToken, 503);
    await http('/products/' + product.id, 'PATCH', { description: 'SQL change durably queued while MongoDB is unavailable' }, seller.accessToken);
    assert.ok(Number(await dc(['exec', '-T', 'postgres', 'psql', '-U', 'nexustech', '-d', 'nexustech', '-At', '-c', 'SELECT count(*) FROM activity_outbox'])) > 0);
  } finally { await dc(['start', 'mongo']); }
  await until('Mongo outbox recovery', async () => (await http('/activity/logs/me', 'GET', undefined, seller.accessToken)).some(event => event.resourceId === product.id && event.eventName === 'product.updated'));
  assert.ok(Number(await dc(['exec', '-T', 'postgres', 'psql', '-U', 'nexustech', '-d', 'nexustech', '-At', '-c', 'SELECT count(*) FROM migrations'])) >= 3);
  await dc(['restart', 'postgres', 'mongo']);
  await until('PostgreSQL recovery', async () => (await http('/health')).database === 'up');
  await dc(['restart', 'api', 'web']);
  await until('four healthy services after restart', healthy);
  assert.equal((await http('/activity/interactions/me', 'GET', undefined, buyer.accessToken)).filter(item => item._id === saved._id).length, 1);
  assert.equal((await http('/orders/' + orders[0].id, 'GET', undefined, buyer.accessToken)).status, 'preparing');
  assert.equal((await http('/products/' + product.id)).stock, 1);
  assert.match(buyer.user.id, /^[a-f0-9-]{36}$/i);
  const mongoCount = await dc(['exec', '-T', 'api', 'node', '-e',
    "const {MongoClient}=require('mongodb'); (async()=>{const c=new MongoClient(process.env.MONGODB_URI);try{await c.connect();console.log(await c.db('nexustech').collection('interactions').countDocuments({senderId:" + JSON.stringify(buyer.user.id) + "}));}finally{await c.close();}})().catch(()=>process.exitCode=1);"]);
  assert.equal(Number(mongoCount), 1);
  console.log('PASS: four healthy services; migrations; private Mongo; concurrent checkout; inventory; Mongo outage/recovery; persistent data after restarts.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
