// Inicialización de colecciones e índices de MongoDB para NexusTech Marketplace
db = db.getSiblingDB('nexustech');

// Colección de eventos de auditoría (ActivityLog)
db.createCollection('activity_logs');
db.activity_logs.createIndex({ resourceId: 1, occurredAt: -1 });
db.activity_logs.createIndex({ userId: 1, occurredAt: -1 });

// Colección de interacciones y consultas (comprador - vendedor)
db.createCollection('interactions');
db.interactions.createIndex({ targetId: 1, createdAt: -1 });
db.interactions.createIndex({ senderId: 1 });
db.interactions.createIndex({ receiverId: 1 });

print('MongoDB: Colecciones activity_logs e interactions configuradas con éxito.');
