import { z } from 'zod';

export const createAccountFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, 'El código es obligatorio.')
      .regex(/^\d+$/, 'El código debe contener únicamente números.')
      .refine(
        (val) => [1, 2, 4, 6].includes(val.length),
        'Longitud inválida. Solo se permite 1 (Clase), 2 (Grupo), 4 (Cuenta) o 6 (Subcuenta).',
      ),
    name: z
      .string()
      .trim()
      .min(2, 'El nombre debe tener al menos 2 caracteres.')
      .max(100, 'El nombre no puede exceder 100 caracteres.'),
    nature: z.enum(['DEBITO', 'CREDITO']).optional(),
  })
  .superRefine((data, ctx) => {
    // Si es Clase (1 dígito), la naturaleza es obligatoria
    if (data.code && data.code.length === 1 && !data.nature) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['nature'],
        message: 'Para cuentas de nivel Clase (1 dígito) es obligatorio definir la naturaleza.',
      });
    }
  });

export type CreateAccountFormData = z.infer<typeof createAccountFormSchema>;

