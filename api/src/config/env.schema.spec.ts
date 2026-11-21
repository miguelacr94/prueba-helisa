import { describe, expect, it } from 'vitest';
import { validateEnv } from './env.schema.js';

describe('Zod Environment Schema (api)', () => {
  it('debe aplicar los valores por defecto cuando no se proveen variables', () => {
    const config = validateEnv({});
    expect(config.PORT).toBe(3000);
    expect(config.HOST).toBe('0.0.0.0');
    expect(config.NODE_ENV).toBe('development');
    expect(config.GLOBAL_PREFIX).toBe('api/v1');
    expect(config.SWAGGER_PATH).toBe('docs');
    expect(config.CORS_ORIGIN).toBe('http://localhost:5173');
    expect(config.DATABASE_PATH).toBe('puc.sqlite');
  });

  it('debe coercionar y validar correctamente variables válidas', () => {
    const config = validateEnv({
      PORT: '4000',
      HOST: '127.0.0.1',
      NODE_ENV: 'production',
      GLOBAL_PREFIX: 'api/v2',
      SWAGGER_PATH: 'swagger',
      CORS_ORIGIN: 'https://app.helisa.com',
      DATABASE_PATH: 'data/prod.sqlite',
    });

    expect(config.PORT).toBe(4000);
    expect(config.HOST).toBe('127.0.0.1');
    expect(config.NODE_ENV).toBe('production');
    expect(config.GLOBAL_PREFIX).toBe('api/v2');
    expect(config.SWAGGER_PATH).toBe('swagger');
    expect(config.CORS_ORIGIN).toBe('https://app.helisa.com');
    expect(config.DATABASE_PATH).toBe('data/prod.sqlite');
  });

  it('debe lanzar error cuando el puerto no es numérico', () => {
    expect(() => validateEnv({ PORT: 'invalido' })).toThrow(/Error de validación Zod/);
  });

  it('debe lanzar error cuando NODE_ENV es un valor no permitido', () => {
    expect(() => validateEnv({ NODE_ENV: 'staging' })).toThrow(/Error de validación Zod/);
  });
});

