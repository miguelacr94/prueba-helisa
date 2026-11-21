# Prueba Técnica Full-Stack: Catálogo de Cuentas Contables (PUC)

[![GitHub Repository](https://img.shields.io/badge/GitHub-miguelacr94%2Fprueba--helisa-181717?style=flat&logo=github)](https://github.com/miguelacr94/prueba-helisa)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x%20%7C%206.x-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/Backend-NestJS%2012-E0234E?style=flat&logo=nestjs)](https://nestjs.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styles-Tailwind%20v4-38B2AC?style=flat&logo=tailwindcss)](https://tailwindcss.com/)

Solución completa para la gestión jerárquica del Plan Único de Cuentas (PUC) desarrollada con **NestJS (Clean Architecture + API Gateway)** en el backend y **React + Vite + TypeScript (Repository Pattern + TanStack Query + Tailwind CSS)** en el frontend.

Repositorio oficial: [https://github.com/miguelacr94/prueba-helisa](https://github.com/miguelacr94/prueba-helisa)

---

## 1. Cómo correr el proyecto

### Requisitos previos
- **Node.js**: Versión 22 (recomendado con `nvm use`).
- **npm**: Versión 10 o superior (`npm -v`).

### Puesta en marcha rápida (Full-Stack)
Desde la raíz del repositorio:

```bash
# 1. Instalar dependencias en raíz, api/ y web/
npm install

# 2. Configurar variables de entorno (opcional, ya existen valores por defecto preconfigurados)
cp api/.env.example api/.env
cp web/.env.example web/.env

# 3. Levantar API y Frontend en paralelo (modo desarrollo)
npm run dev
```

Una vez ejecutado:
- **Frontend Web**: [http://localhost:5173](http://localhost:5173) (o el puerto configurado en `VITE_PORT`)
- **Backend API**: [http://localhost:3000](http://localhost:3000) (o el puerto configurado en `PORT`)
- **Documentación Swagger / OpenAPI**: [http://localhost:3000/docs](http://localhost:3000/docs) (o la ruta en `SWAGGER_PATH`)

### Variables de Entorno (`.env`)

Tanto el backend como el frontend están completamente parametrizados mediante variables de entorno, sin puertos ni URLs de API harcodeados:

#### Backend (`api/.env` / `api/.env.example`)
| Variable | Descripción | Valor por Defecto |
| :--- | :--- | :--- |
| `PORT` | Puerto HTTP donde escucha el servidor NestJS | `3000` |
| `HOST` | Dirección de red / host del servidor | `0.0.0.0` |
| `NODE_ENV` | Entorno de ejecución (`development`, `production`, `test`) | `development` |
| `GLOBAL_PREFIX` | Prefijo global del API Gateway | `api/v1` |
| `SWAGGER_PATH` | Ruta de la documentación interactiva Swagger | `docs` |
| `CORS_ORIGIN` | Orígenes permitidos (separados por coma para múltiples) | `http://localhost:5173` |
| `DATABASE_PATH` | Ruta del archivo de base de datos relacional SQLite | `puc.sqlite` |

#### Frontend (`web/.env` / `web/.env.example`)
| Variable | Descripción | Valor por Defecto |
| :--- | :--- | :--- |
| `VITE_PORT` | Puerto del servidor de desarrollo de Vite | `5173` |
| `VITE_HOST` | Host para el servidor de desarrollo | `localhost` |
| `VITE_API_URL` | URL base del servidor backend (API Gateway) | `http://localhost:3000` |
| `VITE_API_PREFIX` | Prefijo de las rutas de la API consumidas por el cliente | `/api/v1` |

### Scripts disponibles

| Script | Descripción |
| :--- | :--- |
| `npm run dev` | Levanta API (`:3000`) y Web (`:5173`) en simultáneo con recarga en caliente |
| `npm run dev:api` | Levanta únicamente el backend en NestJS |
| `npm run dev:web` | Levanta únicamente el frontend en React + Vite |
| `npm run build` | Compila ambos proyectos (`nest build` y `vite build`) |
| `npm test` | Ejecuta las pruebas unitarias del backend con Vitest (20 pruebas) |
| `npm run test:e2e --prefix api` | Ejecuta las pruebas de integración E2E del API Gateway |
| `npm run lint` | Ejecuta el análisis estático de código con Oxlint en ambos proyectos |

---

## 2. Decisiones Técnicas y de Diseño

### Backend (`api/`)

1. **Arquitectura Limpia (Hexagonal / Ports & Adapters)**:
   - **Capa de Dominio Pura**: Entidades (`Account`) y Enums libres de dependencias de frameworks o librerías de persistencia.
   - **Entidades de Negocio Ricas con Auto-Validación**: La entidad `Account` valida sus propias invariantes al crearse:
     - Longitud numérica válida obligatoria (`1` $\rightarrow$ Clase, `2` $\rightarrow$ Grupo, `4` $\rightarrow$ Cuenta, `6` $\rightarrow$ Subcuenta). Cualquier otra longitud o caracter no numérico es rechazado.
     - Cálculo automático del nivel contable y del prefijo del padre esperado (`110505` $\rightarrow$ `1105`, `1105` $\rightarrow$ `11`, `11` $\rightarrow$ `1`, `1` $\rightarrow$ `null`).
     - Herencia estricta de la naturaleza contable (`DEBITO` / `CREDITO`) desde la Clase raíz.
     - Determinación reactiva de cuentas de movimiento: una cuenta solo admite movimientos contables si es hoja (`acceptsMovements = !hasChildren`).
   - **Casos de Uso con Responsabilidad Única (SRP)**: Cada intención de negocio (`CreateAccountUseCase`, `GetAccountTreeUseCase`, `DeleteAccountUseCase`, etc.) tiene una única responsabilidad y depende exclusivamente de abstracciones (puertos).

2. **Patrón API Gateway Centralizado**:
   - Centraliza el prefijo global (`/api/v1`), la distribución de controladores y el gobierno de la API.
   - **Filtro Global Centralizado (`GatewayExceptionFilter`)**: Intercepta excepciones de dominio (`DomainException`) y de transporte (`class-validator`), traduciéndolas a códigos semánticos HTTP (400, 404, 409, 422) con una estructura JSON unificada:
     ```json
     {
       "success": false,
       "error": {
         "code": "PARENT_ACCOUNT_NOT_FOUND",
         "message": "No se puede crear la cuenta porque su cuenta padre (11) no existe.",
         "path": "/api/v1/accounts"
       }
     }
     ```
   - **Interceptor de Respuestas (`TransformResponseInterceptor`)**: Garantiza formato consistente en todas las peticiones exitosas: `{ success: true, data: ..., timestamp }`.

3. **Persistencia Relacional con SQLite y Relaciones entre Tablas**:
   - Se configuró persistencia relacional con **SQLite** (`better-sqlite3` y TypeORM), asegurando atomicidad y cero configuración externa.
   - **Modelado Relacional de Tablas con Claves Foráneas (`FOREIGN KEY`)**:
     - **Tabla `accounts` (Autorreferencial 1:N)**:
       - Columna `parent_code` con clave foránea referenciando a `accounts(code)` con `ON DELETE RESTRICT`.
       - Una cuenta padre se relaciona con múltiples cuentas hijas (`children`), y cada hija pertenece a un único padre (`parent`).
     - **Tabla `accounting_movements` (Relación 1:N)**:
       - Columna `account_code` con clave foránea referenciando a `accounts(code)` con `ON DELETE RESTRICT`.
       - Cada movimiento contable (asiento con débito y crédito) pertenece estrictamente a una cuenta.
     - **Integridad Referencial**:
       - La base de datos rechaza automáticamente a nivel de motor la eliminación de cuentas que tengan hijas o que registren movimientos asociados.
       - La regla de dominio del PUC *"Solo las cuentas sin hijas admiten movimientos contables"* valida que una cuenta no tenga descendientes antes de registrar un movimiento.
   - **Desacoplamiento Total (Puertos y Adaptadores)**:
     - Los casos de uso dependen únicamente de las abstracciones `AccountRepositoryPort` y `AccountingMovementRepositoryPort`.
     - `SqliteAccountRepository` y `SqliteMovementRepository` actúan como adaptadores de infraestructura sin contaminar el dominio contable.

4. **Documentación Swagger / OpenAPI**:
   - Integrada con `@nestjs/swagger` y disponible en `/docs`. Incluye descripciones de endpoints, esquemas de entrada/salida para cuentas y movimientos, y códigos de estado.

---

### Frontend (`web/`)

1. **Patrón Repository**:
   - Interfaz `IAccountRepository` e implementación `AccountHttpRepository` para desacoplar los componentes visuales de las llamadas de red.

2. **Wrapper HTTP (`HttpClient`)**:
   - Encapsula `fetch`, inyecta prefijos base de API y deserializa automáticamente el sobre `{ success, data }`.
   - Transforma errores del backend en instancias tipadas de `ApiException` con su código y mensaje original.

3. **Gestión de Estado Servidor con TanStack Query**:
   - Clave de consulta `['accounts', 'tree']` con políticas de cache y actualización reactiva.
   - Al crear o eliminar una cuenta, las mutaciones invalidan automáticamente la cache, refrescando el árbol de inmediato sin recargar la página.

4. **Formularios y Validación con React Hook Form + Zod**:
   - Validación síncrona en cliente: verificación de dígitos numéricos y longitudes permitidas (1, 2, 4, 6).
   - Detección visual en vivo del nivel contable y sugerencia automática del código padre.
   - **Mapeo de Errores de la API al Campo Específico**: Si la API rechaza una creación (ej. código duplicado o padre inexistente), el error se proyecta directamente debajo del campo `code` utilizando `setError('code', ...)`.

5. **Gestión de Estado de Interfaz con Zustand**:
   - `ui.store.ts` maneja el estado local del cliente: filtros de búsqueda en vivo, modales de creación/eliminación y nodos del árbol expandidos/colapsados.

6. **Diseño y UX con Tailwind CSS**:
   - Visualización jerárquica con sangría progresiva, badges de Débito/Crédito y etiquetas de cuentas de movimiento.
   - Botón directo `+ Hija` en cada nodo para prellenar el prefijo del padre.
   - Diálogo de confirmación de eliminación con renderizado visible del mensaje de rechazo de la API si la cuenta contiene hijas.
   - Botón de **"Cargar PUC de Ejemplo"** cuando el catálogo está vacío para facilitar pruebas rápidas.

---

## 3. Qué se dejó afuera

- **Motor de persistencia relacional físico (PostgreSQL / MySQL)**: Se priorizó un repositorio en memoria para garantizar que el evaluador no tuviera que levantar Docker ni configurar credenciales de bases de datos.
- **Autenticación y Control de Acceso (JWT / RBAC)**: No se incluyó login de usuarios ni permisos por rol (ej. solo el contador puede eliminar cuentas), ya que excedía el núcleo de la prueba técnica.
- **Paginación y Virtualización en Servidor**: El catálogo se consulta en memoria y se envía completo como árbol recursivo. Para catálogos corporativos con más de 100.000 cuentas se requeriría carga perezosa (*lazy loading* / paginación por ramas).
- **Módulo de Asientos Contables**: Se implementó la regla de negocio `acceptsMovements = !hasChildren`, pero no se construyó la interfaz para registrar débitos y créditos con partida doble.

---

## 4. Qué se haría con más tiempo

1. **Persistencia Híbrida Configurable**:
   - Implementar un adaptador para SQLite o PostgreSQL con Prisma/TypeORM, habilitable mediante una variable de entorno `PERSISTENCE_DRIVER=postgres|memory`, manteniendo intactos los casos de uso y el dominio.
2. **Virtualización del Árbol en Frontend**:
   - Incorporar `@tanstack/react-virtual` para renderizar árboles de decenas de miles de nodos manteniendo 60 FPS sin consumo excesivo de memoria en el navegador.
3. **Módulo de Comprobantes Contables**:
   - Crear el módulo de transacciones contables para emitir asientos (diarios, facturas), asegurando que solo se puedan seleccionar cuentas con `acceptsMovements === true` y validando la regla de partida doble ($\sum \text{Débitos} = \sum \text{Créditos}$).
4. **Exportación y Reportes**:
   - Generación de reportes del Catálogo de Cuentas y Balance de Comprobación en formatos Excel (XLSX) y PDF estructurado.
5. **Pruebas de Componentes Frontend**:
   - Agregar pruebas unitarias con Vitest + Testing Library para los componentes de React (`AccountTree`, `AccountFormModal`).
