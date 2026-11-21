import { z } from 'zod';

/**
 * Esquema de validación estricta con Zod para las variables de entorno del Backend.
 * Garantiza tipos seguros, coerción automática de puertos y valores por defecto válidos.
 */
export const envSchema = z.object({
  PORT: z.coerce.number().int().positive('El puerto debe ser un número entero positivo').default(3000),
  HOST: z.string().min(1, 'El host no puede estar vacío').default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  GLOBAL_PREFIX: z.string().min(1, 'El prefijo global no puede estar vacío').default('api/v1'),
  SWAGGER_PATH: z.string().min(1, 'La ruta de Swagger no puede estar vacía').default('docs'),
  CORS_ORIGIN: z.string().min(1, 'CORS_ORIGIN no puede estar vacío').default('http://localhost:5173'),
  DATABASE_PATH: z.string().min(1, 'DATABASE_PATH no puede estar vacío').default('puc.sqlite'),
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Función de validación requerida por ConfigModule de NestJS
 */
export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const errorMessages = result.error.issues
      .map((issue) => `[${issue.path.join('.')}]: ${issue.message}`)
      .join(', ');
    throw new Error(`❌ Error de validación Zod en variables de entorno (.env): ${errorMessages}`);
  }

  return result.data;
}

