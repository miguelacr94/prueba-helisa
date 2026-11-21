import { z } from 'zod';

/**
 * Esquema de validación estricta con Zod para las variables de entorno del Frontend (Vite).
 * Garantiza tipos seguros y valores por defecto antes de inicializar la aplicación cliente.
 */
export const clientEnvSchema = z.object({
  VITE_PORT: z.coerce.number().int().positive().default(5173),
  VITE_HOST: z.string().default('localhost'),
  VITE_API_URL: z.string().url('VITE_API_URL debe ser una URL válida (ej: http://localhost:3000)').default('http://localhost:3000'),
  VITE_API_PREFIX: z.string().default('/api/v1'),
});

export type ClientEnvConfig = z.infer<typeof clientEnvSchema>;

export function validateClientEnv(): ClientEnvConfig {
  const raw = {
    VITE_PORT: import.meta.env.VITE_PORT,
    VITE_HOST: import.meta.env.VITE_HOST,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_API_PREFIX: import.meta.env.VITE_API_PREFIX,
  };

  const result = clientEnvSchema.safeParse(raw);

  if (!result.success) {
    const errorMessages = result.error.issues
      .map((issue) => `[${issue.path.join('.')}]: ${issue.message}`)
      .join(', ');
    console.error(`❌ Error de validación Zod en variables de entorno (.env) del frontend: ${errorMessages}`);
    throw new Error(`Variables de entorno frontend inválidas: ${errorMessages}`);
  }

  return result.data;
}

export const env = validateClientEnv();

