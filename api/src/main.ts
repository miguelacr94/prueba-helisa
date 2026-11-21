import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { existsSync } from 'node:fs';
import { AppModule } from './app.module.js';
import { GatewayExceptionFilter } from './gateway/filters/gateway-exception.filter.js';
import { TransformResponseInterceptor } from './gateway/interceptors/transform-response.interceptor.js';

// Cargar variables de entorno nativamente en Node si existe .env o .env.local
if (typeof process.loadEnvFile === 'function') {
  if (existsSync('.env.local')) {
    process.loadEnvFile('.env.local');
  } else if (existsSync('.env')) {
    process.loadEnvFile('.env');
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const rawCors = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
  const corsOrigins = rawCors.includes(',')
    ? rawCors.split(',').map((o) => o.trim())
    : rawCors;

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  const globalPrefix = process.env.GLOBAL_PREFIX ?? 'api/v1';
  const swaggerPath = process.env.SWAGGER_PATH ?? 'docs';

  // Prefijo global para todas las rutas del API Gateway
  app.setGlobalPrefix(globalPrefix, {
    exclude: ['/', swaggerPath, `${swaggerPath}-json`],
  });

  // Validación global estricta para DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Filtro centralizado de excepciones y mapeo de errores
  app.useGlobalFilters(new GatewayExceptionFilter());

  // Interceptor global para normalizar respuestas exitosas
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  // Configuración de Documentación OpenAPI / Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Catálogo Contable (PUC)')
    .setDescription(
      'Documentación interactiva de la API del Catálogo de Cuentas Contables. Expone operaciones para la creación con validación de prefijos e integridad referencial, consulta del catálogo como árbol jerárquico anidado y eliminación segura.',
    )
    .setVersion('1.0')
    .addTag('Cuentas Contables (PUC)', 'Operaciones sobre la estructura jerárquica de cuentas')
    .addTag('Sistema', 'Estado del API Gateway')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(swaggerPath, app, document);

  const port = Number(process.env.PORT) || 3000;
  const host = process.env.HOST ?? '0.0.0.0';

  await app.listen(port, host);
}

await bootstrap();
