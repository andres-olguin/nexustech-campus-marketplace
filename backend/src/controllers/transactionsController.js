import db from '../config/db.js';
import { mongoCollections } from '../config/mongo.js';

export async function simulatePayment(req, res) {
  try {
    const {
      monto,
      metodo = 'Webpay Plus Simulado',
      orderCodigo,
      cardNumber = '4242424242424242',
      simulatedOutcome = 'SUCCESS'
    } = req.body;

    const montoNum = Number(monto);
    if (isNaN(montoNum) || montoNum < 1000) {
      return res.status(400).json({ error: 'El monto de la transacción debe ser al menos $1.000 CLP.' });
    }

    const isRejected = simulatedOutcome === 'FAILURE' || cardNumber.endsWith('0000');
    const estado = isRejected ? 'REJECTED' : 'AUTHORIZED';
    const authCode = isRejected ? null : 'AUTH-' + Math.floor(100000 + Math.random() * 900000);
    const token = 'tok_sim_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    const ultimosDigitos = cardNumber.slice(-4) || '4242';

    const tx = {
      id: 'tx-' + Date.now().toString(36),
      token,
      order_codigo: orderCodigo || 'TRK-TEMP',
      monto: Math.round(montoNum),
      metodo,
      estado,
      codigo_autorizacion: authCode,
      ultimos_digitos: ultimosDigitos,
      fecha: new Date()
    };

    const store = db.getMemoryStore();
    store.transactions.unshift(tx);

    // Registro de interacción en MongoDB
    await mongoCollections.interactions.insertOne({
      eventType: 'SIMULATE_PAYMENT',
      userId: req.headers['x-user-id'] || 'anonymous',
      orderCode: tx.order_codigo,
      amount: tx.monto,
      timestamp: new Date(),
      metadata: {
        metodo,
        estado,
        authCode,
        tarjetaMascara: `•••• •••• •••• ${ultimosDigitos}`
      },
      clientIp: req.ip || '127.0.0.1'
    });

    if (isRejected) {
      return res.status(402).json({
        success: false,
        message: 'Transacción rechazada por el emisor simulado (Fondos insuficientes o tarjeta denegada).',
        transaction: tx
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Transacción aprobada exitosamente.',
      voucher: {
        comercio: 'NexusTech Campus Marketplace UNAB',
        tipoTransaccion: 'Venta Webpay Plus Certificada',
        ordenCompra: tx.order_codigo,
        codigoAutorizacion: authCode,
        montoCLP: tx.monto,
        tarjeta: `•••• •••• •••• ${ultimosDigitos}`,
        tipoPago: 'Débito / Crédito Simulado',
        cuotas: '0 (Sin interés)',
        fechaContable: new Date().toLocaleDateString('es-CL'),
        hora: new Date().toLocaleTimeString('es-CL'),
        token: tx.token
      },
      transaction: tx
    });
  } catch (err) {
    console.error('Error simulatePayment:', err);
    return res.status(500).json({ error: 'Error procesando la transacción simulada.' });
  }
}

export async function getTransactionByToken(req, res) {
  try {
    const { token } = req.params;
    const store = db.getMemoryStore();
    const tx = store.transactions.find(t => t.token === token || t.id === token);

    if (!tx) {
      return res.status(404).json({ error: 'Transacción no encontrada.' });
    }

    return res.json(tx);
  } catch (err) {
    return res.status(500).json({ error: 'Error al consultar transacción.' });
  }
}
