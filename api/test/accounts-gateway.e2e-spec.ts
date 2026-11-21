import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { describe, beforeEach, afterEach, it, expect } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { GatewayExceptionFilter } from '../src/gateway/filters/gateway-exception.filter.js';
import { TransformResponseInterceptor } from '../src/gateway/interceptors/transform-response.interceptor.js';
import { AccountNature } from '../src/modules/accounts/domain/enums/account-nature.enum.js';

describe('Accounts Gateway (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    process.env.DATABASE_PATH = ':memory:';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1', { exclude: ['/'] });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new GatewayExceptionFilter());
    app.useGlobalInterceptors(new TransformResponseInterceptor());

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('flujo completo E2E: creación, herencia de naturaleza, validaciones, árbol y eliminación', async () => {
    const server = app.getHttpServer();

    // 1. Crear Clase (1 dígito)
    const createClaseRes = await request(server)
      .post('/api/v1/accounts')
      .send({
        code: '1',
        name: 'ACTIVO',
        nature: AccountNature.DEBITO,
      })
      .expect(201);

    expect(createClaseRes.body.success).toBe(true);
    expect(createClaseRes.body.data.code).toBe('1');
    expect(createClaseRes.body.data.nature).toBe('DEBITO');
    expect(createClaseRes.body.data.acceptsMovements).toBe(true);

    // 2. Rechazar Clase duplicada (409)
    const dupRes = await request(server)
      .post('/api/v1/accounts')
      .send({
        code: '1',
        name: 'ACTIVO REPETIDO',
        nature: AccountNature.DEBITO,
      })
      .expect(409);

    expect(dupRes.body.success).toBe(false);
    expect(dupRes.body.error.code).toBe('ACCOUNT_ALREADY_EXISTS');

    // 3. Rechazar cuenta si el padre no existe (422)
    const orphanRes = await request(server)
      .post('/api/v1/accounts')
      .send({
        code: '21',
        name: 'PROVEEDORES',
      })
      .expect(422);

    expect(orphanRes.body.success).toBe(false);
    expect(orphanRes.body.error.code).toBe('PARENT_ACCOUNT_NOT_FOUND');

    // 4. Crear Grupo (11) heredando naturaleza de Clase 1
    const createGrupoRes = await request(server)
      .post('/api/v1/accounts')
      .send({
        code: '11',
        name: 'DISPONIBLE',
      })
      .expect(201);

    expect(createGrupoRes.body.data.nature).toBe('DEBITO');
    expect(createGrupoRes.body.data.parentCode).toBe('1');

    // 5. Consultar Clase 1 y verificar que acceptsMovements ahora es false porque tiene hija
    const getClaseRes = await request(server).get('/api/v1/accounts/1').expect(200);
    expect(getClaseRes.body.data.hasChildren).toBe(true);
    expect(getClaseRes.body.data.acceptsMovements).toBe(false);

    // 6. Consultar árbol
    const treeRes = await request(server).get('/api/v1/accounts/tree').expect(200);
    expect(treeRes.body.data).toHaveLength(1);
    expect(treeRes.body.data[0].children).toHaveLength(1);

    // 7. No se puede eliminar cuenta con hijas (400)
    const delClaseRes = await request(server).delete('/api/v1/accounts/1').expect(400);
    expect(delClaseRes.body.success).toBe(false);
    expect(delClaseRes.body.error.code).toBe('ACCOUNT_HAS_CHILDREN');

    // 8. Eliminar hija (11) exitosamente
    await request(server).delete('/api/v1/accounts/11').expect(200);

    // 9. Verificar que Clase 1 vuelve a admitir movimientos
    const getClaseAfterRes = await request(server).get('/api/v1/accounts/1').expect(200);
    expect(getClaseAfterRes.body.data.hasChildren).toBe(false);
    expect(getClaseAfterRes.body.data.acceptsMovements).toBe(true);
  });
});

