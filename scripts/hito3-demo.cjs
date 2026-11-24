const { randomBytes } = require('node:crypto');
const { readFileSync, writeFileSync, chmodSync } = require('node:fs');
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

// Los correos son estables, pero las claves se generan una sola vez por entorno.
// Nunca se publican las contraseñas dentro del código ni de GitHub Actions.
const ACCOUNTS = {
  seller: { email: 'vendedor@nexustech.test', name: 'Vendedor de prueba' },
  buyer: { email: 'comprador@nexustech.test', name: 'Comprador de prueba' },
};
const previousReport = resolve(__dirname, '..', '.demo-local.previous.json');

function readReport() {
  try { return JSON.parse(readFileSync(report, 'utf8')); }
  catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}
function saveReport(data) {
  writeFileSync(report, JSON.stringify(data, null, 2) + '\n', { mode: 0o600 });
  chmodSync(report, 0o600);
}
function currentCredentials(data) {
  return data &&
    ['seller', 'buyer'].every(role =>
      data[role]?.email === ACCOUNTS[role].email &&
      typeof data[role].password === 'string' &&
      data[role].password.length >= 12);
}
async function ensureAccount(credentials, name) {
  try {
    return await api('/auth/login', 'POST', credentials);
  } catch (error) {
    // Solo un usuario que aún no existe devuelve 401; otros errores se propagan.
    if (!error.message.includes('HTTP 401')) throw error;
  }
  try {
    return await api('/auth/register', 'POST', { ...credentials, name }, undefined, 201);
  } catch (error) {
    if (error.message.includes('HTTP 409')) {
      throw new Error('El correo ' + credentials.email +
        ' ya existe con otra clave. Revisa el entorno antes de modificar datos.');
    }
    throw error;
  }
}

async function run() {
  await api('/health/ready');
  let saved = readReport();
  if (!currentCredentials(saved)) {
    if (saved) {
      // Respaldo privado de las credenciales aleatorias de la versión anterior.
      try {
        writeFileSync(previousReport, JSON.stringify(saved, null, 2) + '\n',
          { flag: 'wx', mode: 0o600 });
      } catch (error) {
        if (error.code !== 'EEXIST') throw error;
      }
    }
    saved = {
      seller: { email: ACCOUNTS.seller.email, password: randomBytes(18).toString('hex') },
      buyer: { email: ACCOUNTS.buyer.email, password: randomBytes(18).toString('hex') },
    };
    // Guardar primero: si se interrumpe el registro, un nuevo intento
    // conserva la misma clave en vez de perder acceso a la cuenta creada.
    saveReport(saved);
  }
  const [sellerAccount, buyerAccount] = await Promise.all([
    ensureAccount(saved.seller, ACCOUNTS.seller.name),
    ensureAccount(saved.buyer, ACCOUNTS.buyer.name),
  ]);
  if (saved.seller.id === sellerAccount.user.id &&
      saved.buyer.id === buyerAccount.user.id &&
      Array.isArray(saved.products) && saved.products.length === 4) {
    const productsExist = await Promise.all(saved.products.map(async product => {
      try { await api('/products/' + encodeURIComponent(product.id)); return true; }
      catch { return false; }
    }));
    if (productsExist.every(Boolean)) {
      console.log('Cuentas de demo listas: vendedor@nexustech.test y comprador@nexustech.test.');
      console.log('Claves privadas guardadas en .demo-local.json. No las subas a GitHub.');
      return;
    }
  }
  const run = randomBytes(4).toString('hex');
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
  saveReport({
    seller: { ...saved.seller, id: sellerAccount.user.id },
    buyer: { ...saved.buyer, id: buyerAccount.user.id },
    products,
  });
  console.log('Cuatro publicaciones guardadas en PostgreSQL.');
  console.log('Cuentas disponibles: vendedor@nexustech.test y comprador@nexustech.test.');
  console.log('Contraseñas privadas en .demo-local.json (no subir el archivo a GitHub).');
}

run().catch(error => {
  console.error('No se pudo cargar la demo: ' + error.message);
  process.exitCode = 1;
});
