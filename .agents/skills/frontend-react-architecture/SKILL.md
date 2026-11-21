---
name: frontend-react-architecture
description: >-
  Estándares y patrones de arquitectura para Frontend con React, Vite y TypeScript.
  Guía la implementación del patrón Repository, clientes HTTP encapsulados, gestión de estado servidor con TanStack Query,
  validación de esquemas con Zod y React Hook Form, gestión de estado de interfaz con Zustand y maquetación moderna con Tailwind CSS.
---

# Guía de Arquitectura de Frontend (React + Vite + Clean Code)

Esta habilidad establece las directrices para estructurar aplicaciones frontend en React desacopladas de la infraestructura de red, con alta mantenibilidad y experiencia de usuario fluida:

1. **Patrón Repository**: Desacopla los componentes de React de las llamadas directas a `fetch` o `axios`.
2. **Wrapper HTTP**: Encapsula la configuración base, headers, timeouts y el unboxing de la envoltura `{ success, data | error }`.
3. **TanStack Query (React Query)**: Administra el estado del servidor (cache, deduplicación, loading/error states, invalidación tras mutaciones).
4. **Zod + React Hook Form**: Validación síncrona en cliente de reglas de negocio contables (longitudes 1, 2, 4, 6, códigos numéricos, no vacíos) antes de viajar a la red.
5. **Zustand**: Gestión del estado global de UI (filtros de búsqueda, cuenta seleccionada, modales abiertos).
6. **Tailwind CSS**: Estilizado declarativo y accesible.

---

## 1. Estructura de Carpetas

```text
web/src/
├── shared/
│   ├── api/
│   │   ├── http-client.ts             # Wrapper HTTP genérico con manejo de errores
│   │   └── api-types.ts               # Tipos genéricos de respuesta ({ success, data, error })
│   ├── components/                    # Componentes UI reutilizables (Botón, Modal, Badge, Input)
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   └── Badge.tsx
│   └── store/                         # Zustand para estado global de UI
│       └── ui.store.ts
│
├── modules/
│   └── accounts/
│       ├── domain/
│       │   ├── models/
│       │   │   └── account.model.ts   # Modelos de datos del frontend (Account, AccountNode)
│       │   └── repositories/
│       │       └── account.repository.interface.ts # Contrato del repositorio
│       ├── infrastructure/
│       │   └── account-http.repository.ts # Implementación que consume el API Gateway
│       ├── application/
│       │   ├── hooks/                 # Hooks de TanStack Query
│       │   │   ├── use-accounts-tree.hook.ts
│       │   │   ├── use-create-account.hook.ts
│       │   │   └── use-delete-account.hook.ts
│       │   └── schemas/
│       │       └── account-form.schema.ts # Esquema Zod para validación de formulario
│       └── presentation/
│           ├── components/
│           │   ├── AccountTree.tsx     # Visor jerárquico de árbol anidado
│           │   ├── AccountTreeNode.tsx # Nodo interactivo (expandir/colapsar/eliminar)
│           │   ├── AccountFormModal.tsx# Formulario con React Hook Form + Zod
│           │   └── AccountSearchBar.tsx# Buscador y filtros
│           └── AccountsPage.tsx       # Vista principal del módulo contable
│
├── App.tsx
├── main.tsx
└── index.css
```

---

## 2. HTTP Client Wrapper (`shared/api/http-client.ts`)

Encapsula `fetch` asegurando:
- Inyección automática del prefijo (`/api/v1`).
- Desempaquetado del sobre `{ success: true, data: T }`.
- Si `success: false` o HTTP status $\ge 400$, lanza una excepción tipada `ApiException` con el código y mensaje que envió el API Gateway.

```typescript
export class ApiException extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiException';
  }
}
```

---

## 3. Patrón Repository (`account-http.repository.ts`)

El repositorio implementa una interfaz limpia `IAccountRepository`:
```typescript
export interface IAccountRepository {
  getTree(): Promise<AccountTreeNode[]>;
  getAll(): Promise<Account[]>;
  getByCode(code: string): Promise<Account>;
  create(payload: CreateAccountPayload): Promise<Account>;
  delete(code: string): Promise<void>;
}
```
Esto permite cambiar la fuente de datos (o mockearla en pruebas de UI) sin alterar los componentes.

---

## 4. TanStack Query Hooks

- `useAccountsTree()`: Utiliza `useQuery` con clave `['accounts', 'tree']`.
- `useCreateAccount()`: Utiliza `useMutation` e invalida automáticamente la clave `['accounts', 'tree']` al tener éxito.
- `useDeleteAccount()`: Utiliza `useMutation` e invalida la cache, reflejando el cambio de inmediato en la UI.

---

## 5. Validaciones con Zod y React Hook Form

```typescript
export const createAccountSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'El código es requerido')
    .regex(/^\d+$/, 'El código debe contener solo dígitos numéricos')
    .refine(
      (val) => [1, 2, 4, 6].includes(val.length),
      'Longitud inválida. Solo se permite 1 (Clase), 2 (Grupo), 4 (Cuenta) o 6 (Subcuenta)',
    ),
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  nature: z.enum(['DEBITO', 'CREDITO']).optional(),
});
```

