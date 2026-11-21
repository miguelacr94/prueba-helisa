import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { GatewayExceptionFilter } from './gateway/filters/gateway-exception.filter.js';
import { TransformResponseInterceptor } from './gateway/interceptors/transform-response.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173' });

  // Prefijo global para todas las rutas del API Gateway
  app.setGlobalPrefix('api/v1', {
    exclude: ['/', 'docs', 'docs-json'],
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
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

await bootstrap();
