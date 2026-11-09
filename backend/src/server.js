import app from './app.js';
import { initPostgres } from './config/db.js';
import { initMongo } from './config/mongo.js';

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  console.log('====================================================');
  console.log('  NexusTech Marketplace API — Fullstack Hito 3');
  console.log('====================================================');

  await initPostgres();
  await initMongo();

  app.listen(PORT, () => {
    console.log(`[API Server] Servidor escuchando en http://localhost:${PORT}`);
    console.log(`[Swagger UI] Documentación interactiva en http://localhost:${PORT}/api/docs`);
    console.log(`[Healthcheck] Verificación en http://localhost:${PORT}/api/v1/health`);
    console.log('====================================================');
  });
}

bootstrap().catch(err => {
  console.error('Error crítico al iniciar servidor:', err);
  process.exit(1);
});
