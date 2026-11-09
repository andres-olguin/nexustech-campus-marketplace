import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { ErrorsFilter } from './common/errors';
import { addResponseSchemas } from './common/openapi';

export function configureApp(app: INestApplication) {
  app.use(helmet());
  app.enableCors({ origin: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map(s => s.trim()), methods: ['GET','POST','PUT','PATCH','DELETE'], allowedHeaders: ['Content-Type','Authorization'] });
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
