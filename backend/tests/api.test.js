import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

describe('NexusTech Fullstack Hito 3 — Suite de Pruebas Automatizadas', () => {

  test('1. Healthcheck & Diagnóstico de Bases de Datos', async () => {
    const res = await request(app).get('/api/v1/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'online');
    assert.ok(res.body.databases.relational_postgresql.connected);
    assert.ok(res.body.databases.document_mongodb.connected);
  });

  test('2. Swagger UI / OpenAPI 3.0 Documentation', async () => {
    const res = await request(app).get('/api/docs/');
    assert.equal(res.status, 200);
    assert.ok(res.text.includes('Swagger UI') || res.text.includes('swagger'));
  });

  describe('3. Flujo de Autenticación y Perfiles Comprador/Vendedor', () => {
    const testEmail = `test_${Date.now()}@uandresbello.edu`;

    test('Registro de nuevo usuario con rol vendedor', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          nombre: 'Camila Rojas',
          email: testEmail,
          password: 'password123',
          rol: 'vendedor',
          campus: 'Campus Casona UNAB',
          telefono: '+56 9 1122 3344'
        });
      assert.equal(res.status, 201);
      assert.equal(res.body.user.email, testEmail);
      assert.equal(res.body.user.rol, 'vendedor');
    });

    test('Rechazo de registro con email duplicado', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          nombre: 'Duplicado',
          email: testEmail,
          password: 'password123'
        });
      assert.equal(res.status, 409);
    });

    test('Inicio de sesión exitoso', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'password123'
        });
      assert.equal(res.status, 200);
      assert.ok(res.body.token);
      assert.equal(res.body.user.email, testEmail);
    });

    test('Consulta de perfil y alternancia de rol', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testEmail, password: 'password123' });
      const userId = loginRes.body.user.id;

      const profileRes = await request(app)
        .get('/api/v1/auth/me')
        .set('x-user-id', userId);
      assert.equal(profileRes.status, 200);
      assert.equal(profileRes.body.user.id, userId);

      // Alternar a comprador
      const switchRes = await request(app)
        .post('/api/v1/auth/switch-role')
        .send({ userId, targetRole: 'comprador' });
      assert.equal(switchRes.status, 200);
      assert.equal(switchRes.body.user.rol, 'comprador');
    });
  });

  describe('4. Flujo de Productos: CRUD, Filtros, Búsqueda y Paginación', () => {
    let createdProductId = null;

    test('Listar catálogo paginado y filtrar por categoría', async () => {
      const res = await request(app)
        .get('/api/v1/products')
        .query({ page: 1, limit: 4, categoria: 'Hardware' });
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.every(p => p.categoria === 'Hardware'));
      assert.ok(res.body.meta.totalPages >= 1);
    });

    test('Búsqueda por texto insensible a mayúsculas y tildes', async () => {
      const res = await request(app)
        .get('/api/v1/products')
        .query({ search: 'grafica' }); // busca "Gráfica"
      assert.equal(res.status, 200);
      assert.ok(res.body.data.length >= 1);
    });

    test('Publicación de producto validada', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .send({
          nombre: 'Monitor Gamer 240Hz Fast IPS 27 pulgadas',
          categoria: 'Periféricos',
          precio: 349990,
          imagen: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
          descripcion: 'Monitor para esports con 1ms GtG y certificación G-Sync.',
          vendedor_id: 'usr-seller-1',
          vendedor_nombre: 'Andrés Olguín',
          stock: 3
        });
      assert.equal(res.status, 201);
      assert.ok(res.body.product.id);
      createdProductId = res.body.product.id;
    });

    test('Rechazo de publicación con precio inválido (< 1000)', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .send({
          nombre: 'Producto Barato',
          categoria: 'Hardware',
          precio: 500,
          descripcion: 'Descripción válida de más de diez caracteres.'
        });
      assert.equal(res.status, 400);
    });

    test('Edición del producto publicado', async () => {
      assert.ok(createdProductId);
      const res = await request(app)
        .put(`/api/v1/products/${createdProductId}`)
        .send({
          precio: 329990,
          stock: 5
        });
      assert.equal(res.status, 200);
      assert.equal(res.body.product.precio, 329990);
      assert.equal(res.body.product.stock, 5);
    });

    test('Eliminación y restauración del producto', async () => {
      assert.ok(createdProductId);
      // Eliminar
      const delRes = await request(app).delete(`/api/v1/products/${createdProductId}`);
      assert.equal(delRes.status, 200);

      // Verificar que ya no aparece en catálogo activo
      const checkRes = await request(app).get(`/api/v1/products/${createdProductId}`);
      assert.equal(checkRes.status, 404);

      // Restaurar
      const restRes = await request(app).post(`/api/v1/products/${createdProductId}/restore`);
      assert.equal(restRes.status, 200);

      // Verificar que volvió a estar disponible
      const checkRes2 = await request(app).get(`/api/v1/products/${createdProductId}`);
      assert.equal(checkRes2.status, 200);
    });

    test('Conteo por categorías', async () => {
      const res = await request(app).get('/api/v1/products/categories');
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.categories));
      assert.ok(res.body.totalGlobal > 0);
    });
  });

  describe('5. Flujo de Pedidos, Checkout y Rastreo de Estados', () => {
    let orderCode = null;

    test('Creación de pedido con carrito de compras', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .send({
          nombre: 'Nicolás Castro',
          email: 'nicolas.castro@uandresbello.edu',
          direccion: 'Av. República 330',
          ciudad: 'Santiago',
          metodo_pago: 'Webpay Plus Simulado',
          items: [
            { id: 'prod-004', nombre: 'Procesador AMD Ryzen 9 7950X', precio: 529990, cantidad: 1, acabado: 'Estándar' },
            { id: 'prod-006', nombre: 'Teclado Mecánico Custom Keychron Q1', precio: 175000, cantidad: 2, acabado: 'Gris Titanio' }
          ]
        });
      assert.equal(res.status, 201);
      assert.ok(res.body.order.codigo.startsWith('TRK-'));
      assert.equal(res.body.order.total, 529990 + (175000 * 2));
      orderCode = res.body.order.codigo;
    });

    test('Consulta de seguimiento del pedido por código TRK', async () => {
      assert.ok(orderCode);
      const res = await request(app).get(`/api/v1/orders/${orderCode}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.codigo, orderCode);
      assert.equal(res.body.paso, 0);
      assert.ok(Array.isArray(res.body.items));
      assert.equal(res.body.items.length, 2);
    });

    test('Transición de estados del pedido (Avanzar estado)', async () => {
      assert.ok(orderCode);
      // Avanzar al paso 1 (En preparación)
      const res1 = await request(app)
        .patch(`/api/v1/orders/${orderCode}/status`)
        .send({ paso: 1 });
      assert.equal(res1.status, 200);
      assert.equal(res1.body.order.paso, 1);
      assert.equal(res1.body.order.estado, 'En Preparación');

      // Avanzar al paso 2 (En tránsito)
      const res2 = await request(app)
        .patch(`/api/v1/orders/${orderCode}/status`)
        .send({ paso: 2 });
      assert.equal(res2.status, 200);
      assert.equal(res2.body.order.paso, 2);
    });
  });

  describe('6. Simulación de Transacciones Financieras (Webpay Plus)', () => {
    let txToken = null;

    test('Procesamiento de transacción autorizada con comprobante', async () => {
      const res = await request(app)
        .post('/api/v1/transactions/simulate')
        .send({
          monto: 879990,
          metodo: 'Webpay Plus',
          orderCodigo: 'TRK-987654',
          cardNumber: '4242424242424242',
          simulatedOutcome: 'SUCCESS'
        });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.voucher.codigoAutorizacion);
      assert.ok(res.body.voucher.tarjeta.includes('4242'));
      assert.ok(res.body.voucher.token);
      txToken = res.body.voucher.token;
    });

    test('Simulación de transacción rechazada por emisor', async () => {
      const res = await request(app)
        .post('/api/v1/transactions/simulate')
        .send({
          monto: 50000,
          cardNumber: '4000000000000000', // Termina en 0000 -> rechazo
          simulatedOutcome: 'FAILURE'
        });
      assert.equal(res.status, 402);
      assert.equal(res.body.success, false);
      assert.equal(res.body.transaction.estado, 'REJECTED');
    });

    test('Consulta de comprobante por token de transacción', async () => {
      assert.ok(txToken);
      const res = await request(app).get(`/api/v1/transactions/${txToken}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.token, txToken);
      assert.equal(res.body.estado, 'AUTHORIZED');
    });
  });

  describe('7. Registro e Historial No Relacional en MongoDB', () => {
    test('Registrar evento de telemetría de usuario', async () => {
      const res = await request(app)
        .post('/api/v1/interactions')
        .send({
          eventType: 'ADD_TO_CART',
          userId: 'usr-buyer-1',
          productId: 'prod-002',
          productName: 'Apple MacBook Pro 16 M3 Max',
          metadata: { cantidad: 1, acabado: 'Space Black' }
        });
      assert.equal(res.status, 201);
      assert.ok(res.body.id);
    });

    test('Consultar historial filtrado de interacciones MongoDB', async () => {
      const res = await request(app)
        .get('/api/v1/interactions')
        .query({ eventType: 'ADD_TO_CART', limit: 10 });
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.every(i => i.eventType === 'ADD_TO_CART'));
    });

    test('Analítica agregada de eventos en MongoDB', async () => {
      const res = await request(app).get('/api/v1/interactions/analytics');
      assert.equal(res.status, 200);
      assert.ok(res.body.totalInteractionsLogged >= 1);
      assert.ok(res.body.byEventType);
      assert.ok(Array.isArray(res.body.recentActivity));
    });
  });

  describe('8. Integración con API Pública (Tipo de Cambio USD)', () => {
    test('Obtener tasa de cambio USD/CLP desde mindicador.cl con fallback', async () => {
      const res = await request(app).get('/api/v1/exchange/usd');
      assert.equal(res.status, 200);
      assert.ok(res.body.valor > 500 && res.body.valor < 2000);
      assert.ok(res.body.fuente);
    });
  });
});
