import db from '../config/db.js';
import { mongoCollections } from '../config/mongo.js';

const STATUS_STEPS = [
  { paso: 0, label: 'Pedido Confirmado', desc: 'Tu orden fue recibida y el pago simulado fue autorizado.' },
  { paso: 1, label: 'En Preparación', desc: 'El vendedor empaquetó tu producto y prepara el despacho.' },
  { paso: 2, label: 'En Tránsito', desc: 'El producto está en camino hacia el punto de entrega acordado.' },
  { paso: 3, label: 'Entregado en Campus', desc: 'El producto fue recibido conforme en el Campus UNAB.' }
];

export async function createOrder(req, res) {
  try {
    const {
      nombre,
      email,
      direccion,
      ciudad,
      items,
      metodo_pago = 'Webpay Plus Simulado',
      comprador_id = 'usr-buyer-1',
      transaccion_id
    } = req.body;

    if (!nombre || nombre.trim().length < 3) {
      return res.status(400).json({ error: 'El nombre del destinatario es obligatorio (mínimo 3 caracteres).' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'El correo electrónico es inválido.' });
    }
    if (!direccion || direccion.trim().length < 5) {
      return res.status(400).json({ error: 'La dirección de entrega es obligatoria (mínimo 5 caracteres).' });
    }
    if (!ciudad || ciudad.trim().length < 2) {
      return res.status(400).json({ error: 'La ciudad o comuna es obligatoria.' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'El carrito no puede estar vacío.' });
    }

    const store = db.getMemoryStore();

    // Generar código único de rastreo TRK-XXXXXX
    let codigo;
    do {
      codigo = 'TRK-' + (100000 + Math.floor(Math.random() * 900000));
    } while (store.orders.some(o => o.codigo === codigo));

    let totalCalculado = 0;
    const orderItems = [];

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const precio = Number(it.precio) || 0;
      const cantidad = Math.max(1, Number(it.cantidad) || 1);
      const subtotal = precio * cantidad;
      totalCalculado += subtotal;

      orderItems.push({
        id: store.order_items.length + i + 1,
        order_codigo: codigo,
        product_id: it.id || 'custom',
        nombre: it.nombre || 'Artículo de catálogo',
        precio_unitario: precio,
        cantidad,
        acabado: it.acabado || 'Estándar',
        subtotal
      });
    }

    const newOrder = {
      codigo,
      fecha: new Date(),
      comprador_id,
      nombre_cliente: nombre.trim(),
      email_cliente: email.trim(),
      direccion: direccion.trim(),
      ciudad: ciudad.trim(),
      origen: 'Campus Hub Santiago',
      paso: 0,
      estado: STATUS_STEPS[0].label,
      total: totalCalculado,
      metodo_pago,
      transaccion_id: transaccion_id || 'tx-sim-' + Date.now().toString(36)
    };

    store.orders.unshift(newOrder);
    store.order_items.push(...orderItems);

    // Registro de interacción y auditoría en MongoDB
    await mongoCollections.interactions.insertOne({
      eventType: 'CREATE_ORDER',
      userId: comprador_id,
      userEmail: email.trim(),
      orderCode: codigo,
      amount: totalCalculado,
      timestamp: new Date(),
      metadata: { itemsCount: items.length, metodoPago: metodo_pago },
      clientIp: req.ip || '127.0.0.1'
    });

    await mongoCollections.audit_logs.insertOne({
      entity: 'Order',
      entityId: codigo,
      action: 'CREATE',
      performedBy: comprador_id,
      timestamp: new Date(),
      changes: { total: totalCalculado, itemsCount: items.length }
    });

    return res.status(201).json({
      message: 'Pedido creado exitosamente.',
      order: {
        ...newOrder,
        items: orderItems,
        timeline: STATUS_STEPS
      }
    });
  } catch (err) {
    console.error('Error createOrder:', err);
    return res.status(500).json({ error: 'Error interno al procesar el pedido.' });
  }
}

export async function listOrders(req, res) {
  try {
    const store = db.getMemoryStore();
    const { buyerId, email } = req.query;
    let orders = [...store.orders];

    if (buyerId) {
      orders = orders.filter(o => o.comprador_id === buyerId);
    }
    if (email) {
      orders = orders.filter(o => o.email_cliente.toLowerCase() === email.toLowerCase());
    }

    const enriched = orders.map(o => ({
      ...o,
      items: store.order_items.filter(it => it.order_codigo === o.codigo)
    }));

    return res.json({ orders: enriched, total: enriched.length });
  } catch (err) {
    return res.status(500).json({ error: 'Error al listar pedidos.' });
  }
}

export async function getOrderByCode(req, res) {
  try {
    const { codigo } = req.params;
    const store = db.getMemoryStore();
    const order = store.orders.find(o => o.codigo.toUpperCase() === codigo.trim().toUpperCase());

    if (!order) {
      return res.status(404).json({ error: `No se encontró ningún pedido con el código ${codigo}.` });
    }

    const items = store.order_items.filter(it => it.order_codigo === order.codigo);

    return res.json({
      ...order,
      items,
      timeline: STATUS_STEPS,
      pasoActual: STATUS_STEPS[order.paso] || STATUS_STEPS[0]
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error al consultar código de rastreo.' });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { codigo } = req.params;
    const { paso } = req.body;

    const store = db.getMemoryStore();
    const order = store.orders.find(o => o.codigo.toUpperCase() === codigo.trim().toUpperCase());

    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado.' });
    }

    const nuevoPaso = paso !== undefined ? Number(paso) : Math.min(3, order.paso + 1);
    if (isNaN(nuevoPaso) || nuevoPaso < 0 || nuevoPaso > 3) {
      return res.status(400).json({ error: 'El paso de seguimiento debe ser un valor entre 0 y 3.' });
    }

    const anteriorPaso = order.paso;
    order.paso = nuevoPaso;
    order.estado = STATUS_STEPS[nuevoPaso].label;

    await mongoCollections.audit_logs.insertOne({
      entity: 'Order',
      entityId: order.codigo,
      action: 'UPDATE_STATUS',
      performedBy: req.headers['x-user-id'] || 'seller',
      timestamp: new Date(),
      changes: { from: STATUS_STEPS[anteriorPaso].label, to: order.estado, paso: nuevoPaso }
    });

    return res.json({
      message: 'Estado del pedido actualizado.',
      order: {
        ...order,
        items: store.order_items.filter(it => it.order_codigo === order.codigo),
        timeline: STATUS_STEPS
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error al actualizar estado del pedido.' });
  }
}
