import { mongoCollections, getMongoStatus } from '../config/mongo.js';

export async function logInteraction(req, res) {
  try {
    const { eventType, userId, productId, productName, metadata = {} } = req.body;

    if (!eventType) {
      return res.status(400).json({ error: 'El campo eventType es obligatorio.' });
    }

    const doc = {
      eventType,
      userId: userId || req.headers['x-user-id'] || 'anonymous',
      productId: productId || null,
      productName: productName || null,
      timestamp: new Date(),
      metadata,
      clientIp: req.ip || '127.0.0.1'
    };

    const result = await mongoCollections.interactions.insertOne(doc);

    return res.status(201).json({
      message: 'Interacción registrada en MongoDB',
      id: result.insertedId,
      document: doc
    });
  } catch (err) {
    console.error('Error logInteraction:', err);
    return res.status(500).json({ error: 'Error al registrar interacción en MongoDB.' });
  }
}

export async function getInteractionHistory(req, res) {
  try {
    const { eventType, userId, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (eventType) filter.eventType = eventType;
    if (userId) filter.userId = userId;

    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const pageNum = Math.max(1, parseInt(page, 10));
    const skip = (pageNum - 1) * limitNum;

    const cursor = await mongoCollections.interactions.find(filter);
    const items = await cursor.sort({ timestamp: -1 }).skip(skip).limit(limitNum).toArray();
    const total = await mongoCollections.interactions.countDocuments(filter);

    return res.json({
      data: items,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        database: getMongoStatus().database,
        engine: getMongoStatus().engine
      }
    });
  } catch (err) {
    console.error('Error getInteractionHistory:', err);
    return res.status(500).json({ error: 'Error al consultar historial de MongoDB.' });
  }
}

export async function getAnalytics(req, res) {
  try {
    const cursor = await mongoCollections.interactions.find({});
    const all = await cursor.sort({ timestamp: -1 }).limit(500).toArray();

    // Conteo por tipo de evento
    const counts = {};
    all.forEach(item => {
      counts[item.eventType] = (counts[item.eventType] || 0) + 1;
    });

    const recent = all.slice(0, 10);

    return res.json({
      totalInteractionsLogged: all.length,
      byEventType: counts,
      recentActivity: recent,
      mongoStatus: getMongoStatus()
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error al generar analítica de MongoDB.' });
  }
}
