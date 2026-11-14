const { randomBytes } = require('node:crypto');
const { readFileSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');

const report = resolve(__dirname, '..', '.demo-local.json');
const base = 'http://127.0.0.1:3001/api/v1';
async function api(path, method = 'GET', body, token, expected = 200) {
  const reply = await fetch(base + path, {
    method, signal: AbortSignal.timeout(10000),
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: 'Bearer ' + token }) },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
  if (reply.status !== expected) throw new Error(method + ' ' + path + ': HTTP ' + reply.status);
  return reply.json();
}

async function run() {
  try {
    JSON.parse(readFileSync(report, 'utf8'));
    console.log('Ya existe .demo-local.json con las cuentas de demostración. No se cargaron duplicados.');
    return;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  await api('/health/ready');
  const run = randomBytes(4).toString('hex');
  const credentials = name => ({ email: name + '-' + run + '@example.test', password: randomBytes(18).toString('hex') });
  const seller = credentials('vendedor'), buyer = credentials('comprador');
  const [sellerAccount, buyerAccount] = await Promise.all([
    api('/auth/register', 'POST', { ...seller, name: 'Vendedor de prueba' }, undefined, 201),
    api('/auth/register', 'POST', { ...buyer, name: 'Comprador de prueba' }, undefined, 201),
  ]);
  const token = sellerAccount.accessToken;
  const category = await api('/categories', 'POST', { name: 'Componentes demo ' + run }, token, 201);
  const items = [
    { name: 'Memoria RAM demo 8 GB', description: 'Publicación ficticia DDR4 de 8 GB para la prueba del catálogo.', stock: 1, price: 24990,
      technical: { profile: 'memory', text: '8 GB DDR4 DIMM 2666 MT/s', values: { ramGb: 8, ramType: 'DDR4', ramFormat: 'DIMM', ramSpeed: 2666 } } },
    { name: 'Memoria RAM demo 16 GB', description: 'Publicación ficticia DDR4 de 16 GB para la prueba del catálogo.', stock: 2, price: 39990,
      technical: { profile: 'memory', text: '2×8 GB DDR4 DIMM 3200 MT/s', values: { ramGb: 16, ramType: 'DDR4', ramFormat: 'DIMM', ramSpeed: 3200 } } },
    { name: 'Tarjeta de video demo RTX 4060', description: 'Publicación ficticia para probar filtros de tarjeta de video.', stock: 1, price: 199990,
      technical: { profile: 'graphics', text: 'RTX 4060, VRAM 8 GB GDDR6, bus 128 bits', values: { gpuModel: 'RTX 4060', vramGb: 8, vramType: 'GDDR6', vramBusBits: 128 } } },
    { name: 'Teclado mecánico demo', description: 'Publicación ficticia para ensayar una compra y un mensaje.', stock: 2, price: 17990 },
  ];
  const products = [];
  for (const item of items) {
    const product = await api('/products', 'POST', { ...item, categoryId: category.id }, token, 201);
    products.push({ id: product.id, name: product.name, stock: product.stock });
  }
  writeFileSync(report, JSON.stringify({
    seller: { ...seller, id: sellerAccount.user.id },
    buyer: { ...buyer, id: buyerAccount.user.id },
    products,
  }, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  console.log('Cuatro publicaciones guardadas en PostgreSQL. Abrí .demo-local.json para ver las dos cuentas ficticias y los ID.');
}

run().catch(error => {
  console.error('No se pudo cargar la demo: ' + error.message);
  process.exitCode = 1;
});
