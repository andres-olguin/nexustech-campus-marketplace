import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { ErrorsFilter } from './common/errors';
import { addResponseSchemas } from './common/openapi';

export function configureApp(app: INestApplication) {
  app.use(helmet());
  // La APK (Capacitor) carga la web desde http://localhost, https://localhost o capacitor://localhost,
  // así que esos orígenes también tienen que estar permitidos además del de Vite.
  const defaultOrigins = 'http://localhost:5173,http://localhost,https://localhost,capacitor://localhost';
  app.enableCors({ origin: (process.env.CORS_ORIGINS || defaultOrigins).split(',').map(s => s.trim()).filter(Boolean), methods: ['GET','POST','PUT','PATCH','DELETE'], allowedHeaders: ['Content-Type','Authorization'] });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true, forbidUnknownValues: true }));
  app.useGlobalFilters(new ErrorsFilter());
  const config = new DocumentBuilder().setTitle('NexusTech Marketplace').setDescription('API académica. Todas las transacciones son simuladas.').setVersion('1.0.0').addBearerAuth().build();
  const document = SwaggerModule.createDocument(app, config);
  addResponseSchemas(document);
  SwaggerModule.setup('docs', app, document);
  app.enableShutdownHooks();
  return document;
}
