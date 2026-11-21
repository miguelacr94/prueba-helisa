---
name: clean-architecture-monorepo
description: >-
  Aplica Arquitectura Limpia (Hexagonal / Ports & Adapters), patrón API Gateway y principios SOLID en proyectos monorepo con NestJS y TypeScript.
  Úsalo para estructurar carpetas, centralizar la distribución y consumo de servicios con un API Gateway,
  aislar el dominio contable/financiero, crear casos de uso con Responsabilidad Única (SRP),
  encapsular validaciones en entidades de negocio ricas y desacoplar la persistencia mediante puertos y adaptadores.
---

# Guía de Arquitectura Limpia, Monorepo y API Gateway Centralizado

Esta habilidad define los estándares y patrones para estructurar proyectos bajo **Clean Architecture** (Arquitectura Hexagonal / Puertos y Adaptadores), **API Gateway Pattern** y principios **SOLID**, garantizando:
- **API Gateway Centralizado**: Punto único de entrada para distribución y consumo de servicios, enrutamiento, controladores expuestos y manejo centralizado de errores.
- **Independencia de Persistencia**: Desacoplamiento total de motores de bases de datos mediante puertos y adaptadores.
- **Entidades de Negocio Ricas**: Auto-validación interna de invariantes (Domain-Driven Design).
- **Casos de Uso con SRP**: Un caso de uso por intención de negocio con un único método público `execute()`.
- **Estandarización de Respuestas y Errores**: Formato unificado de respuesta (`{ success, data | error, timestamp }`).

---

## 1. La Regla de Dependencia y el Flujo con API Gateway

El **API Gateway** se sitúa en el borde externo (Delivery / Presentation Layer). Recibe las peticiones externas, aplica validaciones de transporte, autenticación/autorización, delega a los casos de uso de los módulos de dominio y centraliza la captura de excepciones y el formateo de respuestas.

```
[ Clientes: Web (React), Mobile, 3rd Party ]
                     │
                     ▼ (HTTP / REST)
┌────────────────────────────────────────────────────────┐
│                   API GATEWAY LAYER                    │
│  - Prefijo Global (/api/v1)                            │
│  - Centralized Controllers (Routing & Distribution)    │
│  - Centralized Filters (Domain & HTTP Error Mapping)   │
│  - Response Transform & Logging Interceptors           │
│  - Global Validation Pipes                             │
└────────────────────┬───────────────────────────────────┘
                     │ Invoca casos de uso (Application)
                     ▼
┌────────────────────────────────────────────────────────┐
│              CORE DOMAIN MODULES (SRP)                 │
│  ├── Application: Use Cases (CreateAccount, etc.)      │
│  ├── Domain: Rich Entities, Value Objects, Ports       │
│  └── Infrastructure: Persistence Adapters (Memory, DB) │
└────────────────────────────────────────────────────────┘
```

---

## 2. Estructura de Carpetas

```text
src/
├── gateway/                             # CAPA API GATEWAY CENTRALIZADA
│   ├── controllers/                     # Controladores centralizados de distribución
│   │   ├── accounts-gateway.controller.ts
│   │   └── health-gateway.controller.ts
│   ├── filters/                         # Manejo centralizado de excepciones
│   │   ├── all-exceptions-gateway.filter.ts   # Captura 500 y errores no previstos
│   │   └── domain-exception-gateway.filter.ts# Mapea excepciones de dominio a HTTP
│   ├── interceptors/                    # Normalización y observabilidad
│   │   ├── transform-response.interceptor.ts  # Envoltorio { success: true, data }
│   │   └── logging.interceptor.ts             # Traza de consumo de servicios
│   ├── pipes/                           # Validación centralizada de DTOs
│   │   └── validation.pipe.ts
│   └── gateway.module.ts                # Importa y orquesta los módulos de la aplicación
│
├── modules/                             # MÓDULOS DE NEGOCIO (Clean Architecture)
│   └── accounts/
│       ├── domain/                      # 100% TypeScript puro
│       │   ├── entities/
│       │   │   └── account.entity.ts    # Entidad rica con auto-validaciones
│       │   ├── value-objects/           # Código, Naturaleza
│       │   ├── enums/                   # CLASE, GRUPO, CUENTA, SUBCUENTA
│       │   ├── ports/
│       │   │   └── account.repository.port.ts # Contrato del repositorio
│       │   └── exceptions/
│       │       └── account-domain.exception.ts# Excepciones de negocio (DomainException)
│       ├── application/
│       │   ├── use-cases/               # Casos de uso con Responsabilidad Única
│       │   │   ├── create-account.use-case.ts
│       │   │   ├── get-account-tree.use-case.ts
│       │   │   ├── find-accounts.use-case.ts
│       │   │   └── delete-account.use-case.ts
│       │   └── dtos/                    # Commands y Outputs del caso de uso
│       ├── infrastructure/
│       │   └── persistence/             # Adaptadores desacoplados
│       │       ├── in-memory/
│       │       │   └── in-memory-account.repository.ts
│       │       └── sqlite/
│       │           └── sqlite-account.repository.ts
│       ├── accounts.tokens.ts           # Token de inyección para el puerto
│       └── accounts.module.ts           # Exporta los casos de uso para el Gateway
│
├── app.module.ts                        # Módulo raíz que monta el Gateway
└── main.ts                              # Bootstrap y registro global del Gateway
```

---

## 3. Patrón API Gateway: Centralización de Distribución y Errores

### A. Centralización de Controladores y Distribución de Consumo
En lugar de dispersar controladores directamente acoplados a la lógica interna:
- Los controladores del **Gateway** residen en `gateway/controllers/`.
- Su responsabilidad es actuar como "embajadores": reciben las peticiones HTTP, validan los DTOs de entrada y delegan la ejecución a los Casos de Uso específicos provistos por los módulos de dominio.
- Permite versionar (`/api/v1/accounts`), aplicar rate-limiting, autenticación y agregar respuestas sin contaminar la capa de aplicación.

Ver ejemplo en [gateway-controller-sample.ts](./examples/gateway-controller-sample.ts).

### B. Centralización de Errores (Filtro Global Unificado)
El Gateway captura cualquier error que ocurra en el sistema y lo transforma en una respuesta uniforme estandarizada (RFC 7807 compatible):
- Si es una `DomainException`: Se traduce al código HTTP semántico correspondiente (400, 404, 409, 422) con su código interno de negocio.
- Si es un `HttpException` (ej. fallo de validación de `class-validator`): Se extrae el detalle de los campos inválidos.
- Si es un error desconocido (500): Se ocultan detalles sensibles en producción y se registra el log.

**Formato de Respuesta de Error Centralizado:**
```json
{
  "success": false,
  "error": {
    "code": "PARENT_ACCOUNT_NOT_FOUND",
    "message": "No se puede crear la cuenta porque su cuenta padre (11) no existe.",
    "details": null,
    "timestamp": "2026-11-20T21:05:00.000Z",
    "path": "/api/v1/accounts"
  }
}
```

Ver ejemplo en [gateway-error-filter-sample.ts](./examples/gateway-error-filter-sample.ts).

### C. Normalización Centralizada de Respuestas Exitosas
Un interceptor en el Gateway envuelve todas las respuestas exitosas de forma homogénea:
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-11-20T21:05:00.000Z"
}
```

---

## 4. Entidades Ricas con Auto-Validaciones Internas
- No crear entidades anémicas que requieran validadores externos para existir en un estado válido.
- La entidad `Account` valida sus propias invariantes al crearse:
  1. Longitud numérica exacta según nivel (`1` -> Clase, `2` -> Grupo, `4` -> Cuenta, `6` -> Subcuenta).
  2. Nombre obligatorio y saneado.
  3. Deducción automática del nivel y del prefijo del padre.
  4. La regla de movimiento: solo cuentas sin hijas admiten movimientos contables (`acceptsMovements = !hasChildren`).

Ver ejemplo en [account-entity-sample.ts](./examples/account-entity-sample.ts).

---

## 5. Desacoplamiento de Persistencia: Puertos y Adaptadores
- El dominio define la interfaz del puerto (`AccountRepositoryPort`).
- NestJS inyecta la implementación mediante `ACCOUNT_REPOSITORY_TOKEN = Symbol('ACCOUNT_REPOSITORY_TOKEN')`.
- Permite alternar entre `InMemoryAccountRepository` (ideal para evaluación inmediata y pruebas) y `SqliteAccountRepository` o `PostgresAccountRepository` modificando únicamente una línea de configuración en `accounts.module.ts`.

Ver ejemplo en [port-and-adapter-sample.ts](./examples/port-and-adapter-sample.ts).
