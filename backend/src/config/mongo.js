import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGO_DB_NAME || 'nexustech_events';

let client = null;
let dbInstance = null;
let useFallback = false;

// Almacén de documentos BSON local para resiliencia
const localInteractions = [
  {
    _id: 'seed-int-1',
    eventType: 'VIEW_PRODUCT',
    userId: 'usr-buyer-1',
    userEmail: 'enrique.chamyr@uandresbello.edu',
    productId: 'prod-003',
    productName: 'Tarjeta Gráfica ASUS ROG Strix GeForce RTX 4080 16GB OC',
    category: 'Hardware',
    timestamp: new Date('2026-10-10T14:15:00Z'),
    metadata: { source: 'catalog_search', term: 'RTX 4080', finishSelected: 'Negro Mate' },
    clientIp: '127.0.0.1'
  },
  {
    _id: 'seed-int-2',
    eventType: 'ADD_TO_CART',
    userId: 'usr-buyer-1',
    userEmail: 'enrique.chamyr@uandresbello.edu',
    productId: 'prod-003',
    productName: 'Tarjeta Gráfica ASUS ROG Strix GeForce RTX 4080 16GB OC',
    category: 'Hardware',
    timestamp: new Date('2026-10-10T14:18:22Z'),
    metadata: { quantity: 1, finish: 'Negro Mate', price: 1199990 },
    clientIp: '127.0.0.1'
  },
  {
    _id: 'seed-int-3',
    eventType: 'SIMULATE_PAYMENT',
    userId: 'usr-buyer-1',
    userEmail: 'enrique.chamyr@uandresbello.edu',
    orderCode: 'TRK-987654',
    amount: 1374990,
    timestamp: new Date('2026-10-10T14:30:00Z'),
    metadata: { provider: 'Webpay Plus Simulado', status: 'AUTHORIZED', authCode: 'AUTH-849201' },
    clientIp: '127.0.0.1'
  },
  {
    _id: 'seed-int-4',
    eventType: 'SEARCH_CATALOG',
    userId: 'usr-hybrid-1',
    userEmail: 'miguel.vargas@uandresbello.edu',
    timestamp: new Date('2026-10-11T09:12:00Z'),
    metadata: { query: 'Workstations i9', resultsFound: 1 },
    clientIp: '127.0.0.1'
  }
];

const localAuditLogs = [
  {
    _id: 'seed-aud-1',
    entity: 'Product',
    entityId: 'prod-001',
    action: 'CREATE',
    performedBy: 'usr-seller-1',
    timestamp: new Date('2026-10-08T10:00:00Z'),
    changes: { status: 'PUBLISHED', price: 1850000 }
  },
  {
    _id: 'seed-aud-2',
    entity: 'Order',
    entityId: 'TRK-987654',
    action: 'UPDATE_STATUS',
    performedBy: 'system',
    timestamp: new Date('2026-10-10T15:00:00Z'),
    changes: { from: 'Pendiente', to: 'En preparación' }
  }
];

export async function initMongo() {
  try {
    client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 1500 });
    await client.connect();
    dbInstance = client.db(DB_NAME);
    useFallback = false;
    console.log(`[MongoDB] Conectado exitosamente a base de datos '${DB_NAME}'.`);
    return { status: 'connected', type: 'mongodb' };
  } catch (err) {
    useFallback = true;
    console.log(`[MongoDB] Host no alcanzable (${err.message}). Activando almacén de documentos BSON local resiliente.`);
    return { status: 'fallback', type: 'local_document_store' };
  }
}

export function getMongoStatus() {
  return {
    engine: useFallback ? 'local_document_store' : 'mongodb_native',
    database: DB_NAME,
    connected: true,
    collections: ['interactions', 'audit_logs'],
    totalInteractions: useFallback ? localInteractions.length : 'dynamic',
    fallbackActive: useFallback
  };
}

export const mongoCollections = {
  interactions: {
    async insertOne(doc) {
      const document = {
        _id: doc._id || 'int-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        ...doc,
        timestamp: doc.timestamp ? new Date(doc.timestamp) : new Date()
      };
      if (!useFallback && dbInstance) {
        try {
          const res = await dbInstance.collection('interactions').insertOne(document);
          return { insertedId: res.insertedId, acknowledged: true };
        } catch (err) {
          console.warn('[MongoDB] Error insertando en Mongo nativo, guardando local:', err.message);
        }
      }
      localInteractions.unshift(document);
      return { insertedId: document._id, acknowledged: true };
    },

    async find(filter = {}) {
      if (!useFallback && dbInstance) {
        try {
          return dbInstance.collection('interactions').find(filter);
        } catch (err) {
          console.warn('[MongoDB] Error consultando Mongo nativo, usando almacén local:', err.message);
        }
      }
      // Implementación local de cursor
      let results = [...localInteractions];
      if (filter.eventType) {
        results = results.filter(i => i.eventType === filter.eventType);
      }
      if (filter.userId) {
        results = results.filter(i => i.userId === filter.userId);
      }
      if (filter.productId) {
        results = results.filter(i => i.productId === filter.productId);
      }

      return {
        sort(sortObj) {
          if (sortObj?.timestamp === -1) {
            results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          } else if (sortObj?.timestamp === 1) {
            results.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          }
          return this;
        },
        skip(n) {
          results = results.slice(n);
          return this;
        },
        limit(n) {
          results = results.slice(0, n);
          return this;
        },
        async toArray() {
          return results;
        }
      };
    },

    async countDocuments(filter = {}) {
      if (!useFallback && dbInstance) {
        try {
          return await dbInstance.collection('interactions').countDocuments(filter);
        } catch (err) {
          console.warn('[MongoDB] Error contando en Mongo nativo:', err.message);
        }
      }
      let count = localInteractions.length;
      if (filter.eventType) {
        count = localInteractions.filter(i => i.eventType === filter.eventType).length;
      }
      return count;
    }
  },

  audit_logs: {
    async insertOne(doc) {
      const document = {
        _id: doc._id || 'aud-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        ...doc,
        timestamp: doc.timestamp ? new Date(doc.timestamp) : new Date()
      };
      if (!useFallback && dbInstance) {
        try {
          return await dbInstance.collection('audit_logs').insertOne(document);
        } catch (err) {
          console.warn('[MongoDB] Error insertando audit_log nativo:', err.message);
        }
      }
      localAuditLogs.unshift(document);
      return { insertedId: document._id, acknowledged: true };
    },

    async find(filter = {}) {
      if (!useFallback && dbInstance) {
        try {
          return dbInstance.collection('audit_logs').find(filter);
        } catch (err) {
          console.warn('[MongoDB] Error consultando audit_logs nativo:', err.message);
        }
      }
      let results = [...localAuditLogs];
      if (filter.entity) {
        results = results.filter(a => a.entity === filter.entity);
      }
      return {
        sort() { return this; },
        async toArray() { return results; }
      };
    }
  }
};
