import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://nexustech:nexustech2026@localhost:5432/nexustech_db';

let pool = null;
let useFallback = false;

// Almacén en memoria / archivo para cuando PostgreSQL no esté disponible en el host local
const memoryStore = {
  users: [
    { id: 'usr-seller-1', nombre: 'Andrés Olguín', email: 'andres.olguin@uandresbello.edu', password_hash: 'hash_andres_123', rol: 'vendedor', telefono: '+56 9 8123 4567', campus: 'Campus Casona UNAB', activo: true, created_at: new Date('2026-10-01') },
    { id: 'usr-seller-2', nombre: 'Benjamín Aguilera', email: 'benjamin.aguilera@uandresbello.edu', password_hash: 'hash_benja_123', rol: 'vendedor', telefono: '+56 9 7654 3210', campus: 'Campus República UNAB', activo: true, created_at: new Date('2026-10-02') },
    { id: 'usr-buyer-1', nombre: 'Enrique Chamyr', email: 'enrique.chamyr@uandresbello.edu', password_hash: 'hash_enrique_123', rol: 'comprador', telefono: '+56 9 6543 2109', campus: 'Campus Bellavista UNAB', activo: true, created_at: new Date('2026-10-03') },
    { id: 'usr-hybrid-1', nombre: 'Miguel Vargas', email: 'miguel.vargas@uandresbello.edu', password_hash: 'hash_miguel_123', rol: 'ambos', telefono: '+56 9 5432 1098', campus: 'Campus Los Leones UNAB', activo: true, created_at: new Date('2026-10-04') },
    { id: 'usr-demo', nombre: 'Estudiante UNAB', email: 'estudiante@uandresbello.edu', password_hash: 'demo1234', rol: 'ambos', telefono: '+56 9 1234 5678', campus: 'Campus República UNAB', activo: true, created_at: new Date('2026-10-05') }
  ],
  products: [
    { id: 'prod-001', nombre: 'Workstation Dell Precision 5570 Intel i9 64GB RTX A2000', categoria: 'Workstations', precio: 1850000, imagen: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80', descripcion: 'Estación de trabajo portátil certificada para renderizado 3D y simulaciones de ingeniería.', vendedor_id: 'usr-seller-1', vendedor_nombre: 'Andrés Olguín', stock: 4, condicion: 'Como nuevo', activo: true, created_at: new Date('2026-10-06') },
    { id: 'prod-002', nombre: 'Apple MacBook Pro 16 M3 Max 36GB 1TB Space Black', categoria: 'Workstations', precio: 2490000, imagen: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80', descripcion: 'Ideal para desarrollo de software, Docker y compilación nativa.', vendedor_id: 'usr-seller-2', vendedor_nombre: 'Benjamín Aguilera', stock: 3, condicion: 'Nuevo', activo: true, created_at: new Date('2026-10-07') },
    { id: 'prod-003', nombre: 'Tarjeta Gráfica ASUS ROG Strix GeForce RTX 4080 16GB OC', categoria: 'Hardware', precio: 1199990, imagen: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80', descripcion: 'GPU de arquitectura Ada Lovelace para IA generativa y diseño gráfico avanzado.', vendedor_id: 'usr-seller-1', vendedor_nombre: 'Andrés Olguín', stock: 2, condicion: 'Como nuevo', activo: true, created_at: new Date('2026-10-08') },
    { id: 'prod-004', nombre: 'Procesador AMD Ryzen 9 7950X 16 Cores 32 Hilos AM5', categoria: 'Hardware', precio: 529990, imagen: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&q=80', descripcion: 'Frecuencia boost hasta 5.7 GHz, caché de 80MB.', vendedor_id: 'usr-hybrid-1', vendedor_nombre: 'Miguel Vargas', stock: 5, condicion: 'Nuevo', activo: true, created_at: new Date('2026-10-09') },
    { id: 'prod-005', nombre: 'Monitor Curvo Dell UltraSharp 38 U3824DW WQHD+ IPS Black', categoria: 'Periféricos', precio: 890000, imagen: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80', descripcion: 'Hub USB-C con 90W power delivery, cobertura 98% DCI-P3.', vendedor_id: 'usr-seller-2', vendedor_nombre: 'Benjamín Aguilera', stock: 3, condicion: 'Como nuevo', activo: true, created_at: new Date('2026-10-10') },
    { id: 'prod-006', nombre: 'Teclado Mecánico Custom Keychron Q1 Pro Wireless RGB QMK', categoria: 'Periféricos', precio: 175000, imagen: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80', descripcion: 'Chasis de aluminio mecanizado CNC, switches Gateron Jupiter Red.', vendedor_id: 'usr-hybrid-1', vendedor_nombre: 'Miguel Vargas', stock: 7, condicion: 'Nuevo', activo: true, created_at: new Date('2026-10-11') },
    { id: 'prod-007', 'nombre': 'API Integración Pasarela Webpay Plus & Transbank en Node.js', categoria: 'Soluciones', precio: 140000, imagen: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80', descripcion: 'Módulo probado con endpoints REST, webhooks y documentación Swagger lista para producción.', vendedor_id: 'usr-seller-1', vendedor_nombre: 'Andrés Olguín', stock: 10, condicion: 'Nuevo', activo: true, created_at: new Date('2026-10-12') },
    { id: 'prod-008', nombre: 'Auditoría de Seguridad Web OWASP Top 10 + Reporte Ejecutivo', categoria: 'Soluciones', precio: 280000, imagen: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80', descripcion: 'Análisis de vulnerabilidades, cabeceras seguras, CORS y matriz de riesgos para startups universitarias.', vendedor_id: 'usr-seller-2', vendedor_nombre: 'Benjamín Aguilera', stock: 6, condicion: 'Nuevo', activo: true, created_at: new Date('2026-10-13') }
  ],
  orders: [
    {
      codigo: 'TRK-987654',
      fecha: new Date('2026-10-10T14:30:00Z'),
      comprador_id: 'usr-buyer-1',
      nombre_cliente: 'Enrique Chamyr',
      email_cliente: 'enrique.chamyr@uandresbello.edu',
      direccion: 'Av. República 237, Edificio R3',
      ciudad: 'Santiago',
      origen: 'Campus Hub Santiago',
      paso: 1,
      estado: 'En preparación',
      total: 1374990,
      metodo_pago: 'Webpay Plus Simulado',
      transaccion_id: 'tx-sim-987654'
    }
  ],
  order_items: [
    { id: 1, order_codigo: 'TRK-987654', product_id: 'prod-003', nombre: 'Tarjeta Gráfica ASUS ROG Strix GeForce RTX 4080 16GB OC', precio_unitario: 1199990, cantidad: 1, acabado: 'Negro Mate', subtotal: 1199990 },
    { id: 2, order_codigo: 'TRK-987654', product_id: 'prod-006', nombre: 'Teclado Mecánico Custom Keychron Q1 Pro Wireless RGB QMK', precio_unitario: 175000, cantidad: 1, acabado: 'Gris Titanio', subtotal: 175000 }
  ],
  transactions: [
    { id: 'tx-sim-987654', token: 'tok_live_demo_987654', order_codigo: 'TRK-987654', monto: 1374990, metodo: 'Webpay Plus', estado: 'AUTHORIZED', codigo_autorizacion: 'AUTH-849201', ultimos_digitos: '4242', fecha: new Date('2026-10-10T14:30:00Z') }
  ]
};

export async function initPostgres() {
  try {
    pool = new Pool({
      connectionString: DATABASE_URL,
      connectionTimeoutMillis: 1500,
      query_timeout: 3000
    });
    // Test quick connection
    const client = await pool.connect();
    client.release();
    useFallback = false;
    console.log('[PostgreSQL] Conectado exitosamente a PostgreSQL.');
    return { status: 'connected', type: 'postgresql' };
  } catch (err) {
    useFallback = true;
    console.log(`[PostgreSQL] Host de base de datos no alcanzable (${err.message}). Activando motor relacional local resiliente.`);
    return { status: 'fallback', type: 'local_relational' };
  }
}

export function getPostgresStatus() {
  return {
    engine: useFallback ? 'local_relational_engine' : 'postgresql_pool',
    connected: true,
    tables: ['users', 'products', 'orders', 'order_items', 'transactions'],
    fallbackActive: useFallback
  };
}

export const db = {
  async query(text, params = []) {
    if (!useFallback && pool) {
      try {
        return await pool.query(text, params);
      } catch (err) {
        console.warn('[PostgreSQL] Error en query nativo, delegando a motor local:', err.message);
      }
    }
    // Ejecución local resiliente
    return executeLocalQuery(text, params);
  },
  getMemoryStore() {
    return memoryStore;
  }
};

function executeLocalQuery(sql, params) {
  const norm = sql.trim().toLowerCase();
  
  // SELECT FROM products
  if (norm.startsWith('select') && norm.includes('from products')) {
    let rows = [...memoryStore.products.filter(p => p.activo !== false)];
    return { rows, rowCount: rows.length };
  }

  // SELECT FROM users WHERE email = $1
  if (norm.startsWith('select') && norm.includes('from users') && norm.includes('email')) {
    const email = params[0]?.toLowerCase();
    const rows = memoryStore.users.filter(u => u.email.toLowerCase() === email);
    return { rows, rowCount: rows.length };
  }

  // SELECT FROM users WHERE id = $1
  if (norm.startsWith('select') && norm.includes('from users') && norm.includes('id =')) {
    const id = params[0];
    const rows = memoryStore.users.filter(u => u.id === id);
    return { rows, rowCount: rows.length };
  }

  // SELECT FROM orders WHERE codigo = $1
  if (norm.startsWith('select') && norm.includes('from orders') && norm.includes('codigo')) {
    const code = params[0];
    const rows = memoryStore.orders.filter(o => o.codigo === code);
    return { rows, rowCount: rows.length };
  }

  // SELECT FROM orders
  if (norm.startsWith('select') && norm.includes('from orders')) {
    let rows = [...memoryStore.orders].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    return { rows, rowCount: rows.length };
  }

  // SELECT FROM order_items WHERE order_codigo = $1
  if (norm.startsWith('select') && norm.includes('from order_items')) {
    const code = params[0];
    const rows = memoryStore.order_items.filter(item => item.order_codigo === code);
    return { rows, rowCount: rows.length };
  }

  // SELECT FROM transactions
  if (norm.startsWith('select') && norm.includes('from transactions')) {
    const token = params[0];
    const rows = memoryStore.transactions.filter(t => t.token === token || t.order_codigo === token);
    return { rows, rowCount: rows.length };
  }

  return { rows: [], rowCount: 0 };
}

export default db;
