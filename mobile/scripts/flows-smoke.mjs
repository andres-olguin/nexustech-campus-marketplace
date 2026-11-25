// Ejecuta los flujos de la app contra una API real usando EL MISMO cliente HTTP
// de la app (src/services/api.js), empaquetado con esbuild.
// Uso: node scripts/flows-smoke.mjs <urlBase> <ruta .demo-local.json>
import { build } from 'esbuild';
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const [baseUrl = 'http://127.0.0.1:3001', demoFile = resolve(here, '../../.demo-local.json')] = process.argv.slice(2);
const out = resolve(here, '../.smoke-api.bundle.mjs');
await build({
  entryPoints: [resolve(here, '../src/services/api.js')], bundle: true, format: 'esm', platform: 'node',
  outfile: out, logLevel: 'error',
  alias: { 'expo-secure-store': resolve(here, 'stub-secure-store.mjs') },
});
const { api, configure, cleanUrl } = await import(pathToFileURL(out).href);
configure({ baseUrl: cleanUrl(baseUrl) });

const demo = JSON.parse(readFileSync(demoFile, 'utf8'));
const results = [];
async function step(name, fn) {
  try { const detail = await fn(); results.push({ name, ok: true, detail }); console.log('OK   ' + name + (detail ? ' — ' + detail : '')); }
  catch (e) { results.push({ name, ok: false, detail: e.message }); console.log('FALLA ' + name + ' — ' + e.message); }
}
const need = (cond, msg) => { if (!cond) throw new Error(msg); };
const as = (session) => configure({ token: session.accessToken });

let seller, buyer, product, order;
await step('Probar conexión (health/ready)', async () => { const r = await api.ready(); return JSON.stringify(r).slice(0, 80); });
await step('Registro con clave corta es rechazado', async () => {
  try { await api.register('x-' + randomBytes(3).toString('hex') + '@example.test', 'corta', 'Prueba'); }
  catch (e) { need(e.status === 400, 'esperaba 400, llegó ' + e.status); return e.message.slice(0, 80); }
  throw new Error('la API aceptó una clave corta');
});
await step('Registro de cuenta nueva', async () => {
  const email = 'nuevo-' + randomBytes(4).toString('hex') + '@example.test';
  const r = await api.register(email, randomBytes(12).toString('hex'), 'Cuenta nueva');
  need(r.accessToken, 'sin accessToken'); return email;
});
await step('Login vendedor demo', async () => { seller = await api.login(demo.seller.email, demo.seller.password); need(seller.accessToken, 'sin token'); return demo.seller.email; });
await step('Login comprador demo', async () => { buyer = await api.login(demo.buyer.email, demo.buyer.password); need(buyer.accessToken, 'sin token'); return demo.buyer.email; });
await step('Login con clave incorrecta es rechazado', async () => {
  try { await api.login(demo.buyer.email, 'incorrecta-incorrecta'); } catch (e) { need(e.status === 401, 'esperaba 401, llegó ' + e.status); return '401'; }
  throw new Error('la API aceptó una clave incorrecta');
});

as(buyer);
await step('Perfil (users/me)', async () => { const me = await api.me(); need(me.email === demo.buyer.email, 'correo distinto'); return me.email; });
await step('Catálogo: categorías', async () => { const c = await api.categories(); need(Array.isArray(c?.items ?? c), 'forma inesperada'); return String((c.items ?? c).length) + ' categorías'; });
await step('Catálogo: listado y búsqueda «RAM»', async () => {
  const all = await api.products({ page: 1, limit: 20 });
  need(all.items?.length > 0, 'catálogo vacío');
  const ram = await api.products({ search: 'RAM', limit: 20 });
  need(ram.items?.length > 0, 'búsqueda sin resultados');
  product = (await api.products({ search: 'Teclado', limit: 20 })).items.find((p) => p.stock > 0) ?? all.items.find((p) => p.stock > 0);
  need(product, 'ningún producto con stock');
  return all.items.length + ' productos, ' + ram.items.length + ' con «RAM»';
});
await step('Detalle de producto', async () => { const p = await api.product(product.id); need(p.id === product.id && p.sellerId, 'sin sellerId'); product = p; return p.name; });
await step('Favoritos: agregar, listar, quitar', async () => {
  await api.addFavorite(product.id);
  const f = await api.favorites({ limit: 50 });
  need((f.items ?? f).some((x) => (x.productId ?? x.product?.id ?? x.id) === product.id), 'no aparece en favoritos');
  await api.removeFavorite(product.id);
  return 'ok';
});
await step('Carrito: agregar y leer', async () => {
  await api.setCartItem(product.id, 1);
  const c = await api.cart(); need(c.items.some((i) => i.productId === product.id), 'no está en el carrito'); return c.items.length + ' ítem(s)';
});
await step('Compra simulada', async () => {
  order = await api.checkout('Av. Los Castaños 123, Viña del Mar', randomBytes(8).toString('hex') + '-key');
  need(order.id, 'sin id de pedido'); return 'pedido ' + String(order.id).slice(0, 8) + ' estado ' + order.status;
});
await step('Pedidos del comprador', async () => {
  const o = await api.orders({ limit: 20 }); need((o.items ?? o).some((x) => x.id === order.id), 'el pedido no aparece');
  const d = await api.order(order.id); return 'estado ' + d.status;
});
await step('Pregunta del comprador al vendedor (MongoDB)', async () => {
  await api.sendInteraction(product.id, product.sellerId, 'Hola, ¿sigue disponible? (prueba automática)');
  const list = await api.interactions(product.id); need((list.items ?? list).length > 0, 'la pregunta no se guardó'); return 'guardada';
});

as(seller);
await step('Vendedor: ve la venta', async () => {
  const s = await api.sales({ limit: 20 }); const items = s.items ?? s;
  need(items.some((x) => x.id === order.id), 'la venta no aparece'); return items.length + ' venta(s)';
});
await step('Vendedor: ve la pregunta y responde', async () => {
  const list = await api.interactions(product.id); const items = list.items ?? list; need(items.length > 0, 'no ve la pregunta');
  const q = items[0]; await api.sendInteraction(product.id, q.senderId ?? buyer.user?.id, 'Sí, disponible. (respuesta automática)'); return 'respondida';
});
for (const next of ['preparing', 'shipped', 'delivered']) {
  await step('Vendedor: avanzar a ' + next, async () => { await api.advanceSale(order.id, next); return next; });
}
as(buyer);
await step('Comprador: ve el estado avanzado', async () => {
  const d = await api.order(order.id);
  const st = d.fulfillment?.status ?? d.status; need(st === 'delivered' || d.status === 'delivered', 'estado actual ' + st); return st;
});
await step('Cancelar un pedido recién creado', async () => {
  const p2 = (await api.products({ limit: 20 })).items.find((p) => p.stock > 0 && p.id !== product.id) ?? product;
  await api.setCartItem(p2.id, 1);
  const o2 = await api.checkout('Calle Valparaíso 456, Viña del Mar', randomBytes(8).toString('hex') + '-key2');
  const c = await api.cancelOrder(o2.id); return 'estado ' + (c.status ?? 'cancelled');
});

const failed = results.filter((r) => !r.ok);
console.log('\nResumen: ' + (results.length - failed.length) + '/' + results.length + ' pasos correctos');
if (failed.length) { console.log('Fallaron: ' + failed.map((f) => f.name).join(' | ')); process.exitCode = 1; }
