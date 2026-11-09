import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swaggerSpec.js';

import authRoutes from './routes/authRoutes.js';
import productsRoutes from './routes/productsRoutes.js';
import ordersRoutes from './routes/ordersRoutes.js';
import transactionsRoutes from './routes/transactionsRoutes.js';
import interactionsRoutes from './routes/interactionsRoutes.js';
import exchangeRoutes from './routes/exchangeRoutes.js';
import { getPostgresStatus } from './config/db.js';
import { getMongoStatus } from './config/mongo.js';

const app = express();

// Middlewares globales
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI Interactivo
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'NexusTech API Docs · UNAB Hito 3',
  customCss: '.swagger-ui .topbar { background-color: #0d1627; border-bottom: 2px solid #00d2ff; }'
}));
app.use('/docs', (req, res) => res.redirect('/api/docs'));

// Healthcheck & Diagnóstico de Bases de Datos
app.get('/api/v1/health', (req, res) => {
  const pgStatus = getPostgresStatus();
  const mongoStatus = getMongoStatus();

  res.json({
    status: 'online',
    project: 'NexusTech Campus Marketplace',
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    databases: {
      relational_postgresql: pgStatus,
      document_mongodb: mongoStatus
    },
    endpoints: {
      swagger: '/api/docs',
      auth: '/api/v1/auth',
      products: '/api/v1/products',
      orders: '/api/v1/orders',
      transactions: '/api/v1/transactions',
      interactions: '/api/v1/interactions',
      exchange: '/api/v1/exchange'
    }
  });
});

// Rutas de la API v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/orders', ordersRoutes);
app.use('/api/v1/transactions', transactionsRoutes);
app.use('/api/v1/interactions', interactionsRoutes);
app.use('/api/v1/exchange', exchangeRoutes);

// Manejador 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.originalUrl,
    metodo: req.method,
    docs: '/api/docs'
  });
});

// Manejador de errores globales
app.use((err, req, res, next) => {
  console.error('[Error Global Handler]:', err.stack || err);
  res.status(500).json({
    error: 'Error interno en el servidor NexusTech',
    detalles: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

export default app;
