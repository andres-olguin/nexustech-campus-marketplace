// ====================================================================
// NexusTech Campus Marketplace — DDL Inicial MongoDB
// Hito 3: Persistencia No Relacional / Telemetría e Interacciones
// ====================================================================

db = db.getSiblingDB('nexustech_events');

// Colección: interactions
db.createCollection('interactions');
db.interactions.createIndex({ timestamp: -1 });
db.interactions.createIndex({ eventType: 1, timestamp: -1 });
db.interactions.createIndex({ userId: 1 });
db.interactions.createIndex({ productId: 1 });

// Colección: audit_logs
db.createCollection('audit_logs');
db.audit_logs.createIndex({ timestamp: -1 });
db.audit_logs.createIndex({ entity: 1, entityId: 1 });

// Eventos de interacción semilla para demostración
db.interactions.insertMany([
  {
    eventType: "VIEW_PRODUCT",
    userId: "usr-buyer-1",
    userEmail: "enrique.chamyr@uandresbello.edu",
    productId: "prod-003",
    productName: "Tarjeta Gráfica ASUS ROG Strix GeForce RTX 4080 16GB OC",
    category: "Hardware",
    timestamp: new Date("2026-10-10T14:15:00Z"),
    metadata: { source: "catalog_search", term: "RTX 4080", finishSelected: "Negro Mate" },
    clientIp: "127.0.0.1"
  },
  {
    eventType: "ADD_TO_CART",
    userId: "usr-buyer-1",
    userEmail: "enrique.chamyr@uandresbello.edu",
    productId: "prod-003",
    productName: "Tarjeta Gráfica ASUS ROG Strix GeForce RTX 4080 16GB OC",
    category: "Hardware",
    timestamp: new Date("2026-10-10T14:18:22Z"),
    metadata: { quantity: 1, finish: "Negro Mate", price: 1199990 },
    clientIp: "127.0.0.1"
  },
  {
    eventType: "SIMULATE_PAYMENT",
    userId: "usr-buyer-1",
    userEmail: "enrique.chamyr@uandresbello.edu",
    orderCode: "TRK-987654",
    amount: 1374990,
    timestamp: new Date("2026-10-10T14:30:00Z"),
    metadata: { provider: "Webpay Plus Simulado", status: "AUTHORIZED", authCode: "AUTH-849201" },
    clientIp: "127.0.0.1"
  },
  {
    eventType: "SEARCH_CATALOG",
    userId: "usr-hybrid-1",
    userEmail: "miguel.vargas@uandresbello.edu",
    timestamp: new Date("2026-10-11T09:12:00Z"),
    metadata: { query: "Workstations i9", resultsFound: 1 },
    clientIp: "127.0.0.1"
  }
]);

// Registros de auditoría semilla
db.audit_logs.insertMany([
  {
    entity: "Product",
    entityId: "prod-001",
    action: "CREATE",
    performedBy: "usr-seller-1",
    timestamp: new Date("2026-10-08T10:00:00Z"),
    changes: { status: "PUBLISHED", price: 1850000 }
  },
  {
    entity: "Order",
    entityId: "TRK-987654",
    action: "UPDATE_STATUS",
    performedBy: "system",
    timestamp: new Date("2026-10-10T15:00:00Z"),
    changes: { from: "Pendiente", to: "En preparación" }
  }
]);

print("Init MongoDB completado exitosamente para NexusTech.");
