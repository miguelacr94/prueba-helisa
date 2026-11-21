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

Tanto el backend como el frontend están completamente parametrizados mediante variables de entorno, **sin puertos, hosts, rutas de base de datos ni URLs de API harcodeados**. Cada subproyecto cuenta con su propia plantilla `.env.example`, y en la raíz del repositorio se dispone de una plantilla unificada.

#### 1. Backend (`api/.env` / `api/.env.example`)

| Variable        |   Tipo   | Descripción                                                               | Valor por Defecto       | Ejemplo / Uso                                             |
| :-------------- | :------: | :------------------------------------------------------------------------ | :---------------------- | :-------------------------------------------------------- |
| `PORT`          | `number` | Puerto HTTP donde el servidor NestJS escucha peticiones                   | `3000`                  | `PORT=4000`                                               |
| `HOST`          | `string` | Dirección IP o interfaz de red para el binding del servidor               | `0.0.0.0`               | `HOST=127.0.0.1`                                          |
| `NODE_ENV`      | `string` | Entorno de ejecución (`development`, `production`, `test`)                | `development`           | `NODE_ENV=production`                                     |
| `GLOBAL_PREFIX` | `string` | Prefijo global del API Gateway para todas las rutas REST                  | `api/v1`                | `GLOBAL_PREFIX=api/v2`                                    |
| `SWAGGER_PATH`  | `string` | Ruta relativa para acceder a la documentación interactiva OpenAPI         | `docs`                  | `SWAGGER_PATH=swagger`                                    |
| `CORS_ORIGIN`   | `string` | Orígenes web autorizados para CORS (admite listas separadas por coma)     | `http://localhost:5173` | `CORS_ORIGIN=http://localhost:5173,https://midominio.com` |
| `DATABASE_PATH` | `string` | Ruta del archivo de base de datos SQLite relacional (`:memory:` para RAM) | `puc.sqlite`            | `DATABASE_PATH=data/puc_prod.sqlite`                      |

#### 2. Frontend (`web/.env` / `web/.env.example`)

| Variable          |   Tipo   | Descripción                                                         | Valor por Defecto       | Ejemplo / Uso                        |
| :---------------- | :------: | :------------------------------------------------------------------ | :---------------------- | :----------------------------------- |
| `VITE_PORT`       | `number` | Puerto local en el que se levanta el servidor de desarrollo de Vite | `5173`                  | `VITE_PORT=8080`                     |
| `VITE_HOST`       | `string` | Host para el servidor de desarrollo de Vite                         | `localhost`             | `VITE_HOST=0.0.0.0`                  |
| `VITE_API_URL`    | `string` | URL base del servidor backend (API Gateway)                         | `http://localhost:3000` | `VITE_API_URL=http://localhost:4000` |
| `VITE_API_PREFIX` | `string` | Prefijo global consumido por el cliente HTTP (`HttpClient`)         | `/api/v1`               | `VITE_API_PREFIX=/api/v1`            |

#### Escenarios de Configuración Comunes

- **Cambio de puertos para evitar colisiones (ej. Backend en `:4000` y Frontend en `:8080`):**
  1. En `api/.env`: configurar `PORT=4000` y `CORS_ORIGIN=http://localhost:8080`.
  2. En `web/.env`: configurar `VITE_PORT=8080` y `VITE_API_URL=http://localhost:4000`.
- **Base de Datos en Directorio Personalizado:**
  - En `api/.env`: `DATABASE_PATH=data/contabilidad_2026.sqlite`.
- **Despliegue a Producción o Red Local:**
  - En `api/.env`: `HOST=0.0.0.0` y `CORS_ORIGIN=https://app.helisa.com`.
  - En `web/.env`: `VITE_API_URL=https://api.helisa.com`.

### Scripts disponibles

| Script                          | Descripción                                                                                      |
| :------------------------------ | :----------------------------------------------------------------------------------------------- |
| `npm run dev`                   | Levanta API (`:3000`) y Web (`:5173`) en simultáneo con recarga en caliente                      |
| `npm run dev:api`               | Levanta únicamente el backend en NestJS                                                          |
| `npm run dev:web`               | Levanta únicamente el frontend en React + Vite                                                   |
| `npm run build`                 | Compila ambos proyectos (`nest build` y `vite build`)                                            |
| `npm test`                      | Ejecuta las pruebas unitarias del backend con Vitest (34 pruebas en 10 suites)                    |
| `npm run test:e2e --prefix api` | Ejecuta las pruebas de integración E2E del API Gateway                                           |
| `npm run lint`                  | Ejecuta el análisis estático de código con Oxlint en ambos proyectos (0 advertencias, 0 errores) |

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
       - La regla de dominio del PUC _"Solo las cuentas sin hijas admiten movimientos contables"_ valida que una cuenta no tenga descendientes antes de registrar un movimiento.
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

6. **Búsqueda con Debounce Reactivo y Consulta Vía API**:
   - Hook `useDebounce` (350ms por defecto) y `useSearchAccounts` integrados con TanStack Query.
   - Consume en tiempo real el endpoint `GET /api/v1/accounts?search=...`, reduciendo la carga de red y evitando peticiones redundantes.
   - Cálculo automático de ancestros del PUC (Clase $\rightarrow$ Grupo $\rightarrow$ Cuenta $\rightarrow$ Subcuenta) para auto-expandir las ramas donde se ubican las cuentas coincidentes.
   - Retroalimentación de interfaz en vivo: indicador de tipeo con debounce, animación de carga con spinner durante la consulta a la API y pill de resumen con el conteo de cuentas encontradas.

7. **Diseño y UX Responsivo Adaptativo para Móviles**:
   - Visualización jerárquica con sangría progresiva, badges de Débito/Crédito y etiquetas de cuentas de movimiento.
   - Barra de búsqueda y controles de expansión 100% responsivos adaptables a cualquier resolución de pantalla (móvil, tablet y desktop).
   - Botón directo `+ Hija` en cada nodo para prellenar el prefijo del padre.
   - Diálogo de confirmación de eliminación con renderizado visible del mensaje de rechazo de la API si la cuenta contiene hijas.
   - Botón de **"Cargar PUC de Ejemplo"** cuando el catálogo está vacío para facilitar pruebas rápidas.

---

## 3. Qué se dejó afuera

- **Motor de persistencia relacional físico (PostgreSQL / MySQL)**: Se priorizó un repositorio en memoria para garantizar que el evaluador no tuviera que levantar Docker ni configurar credenciales de bases de datos.
- **Autenticación y Control de Acceso (JWT / RBAC)**: No se incluyó login de usuarios ni permisos por rol (ej. solo el contador puede eliminar cuentas), ya que excedía el núcleo de la prueba técnica.
- **Paginación y Virtualización en Servidor**: El catálogo se consulta en memoria y se envía completo como árbol recursivo. Para catálogos corporativos con más de 100.000 cuentas se requeriría carga perezosa (_lazy loading_ / paginación por ramas).
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

La razon de implementar este tipo de arquitectura es con el fin de poner implementar patrones y principios de arquitectura limpia y solid en una aplicacion web adicional que al mantener estos princios podemos realizar una separacion entre la logica del negocio y la tecnologia, en caso tal que en un futuro se quisiera cambiar el motor de persistencia, se podria hacer sin afectar la logica de negocio.

1. **Arquitectura Hexagonal / Portales y Adaptadores**:
   - **Por qué**: Permite aislar la lógica de negocio (Use Cases) de la infraestructura (Repositorios, Controladores).
   - **Beneficio**: El código de negocio no conoce si está leyendo de una base de datos SQL, un archivo JSON o una API externa. Esto facilita enormemente el testing y el mantenimiento.

2. **Clean Code & SOLID**:
   - **Por qué**: Principios como la Responsabilidad Única (SRP) y la Inversión de Dependencias (DIP) son la base de esta arquitectura.
   - **Beneficio**: Código predecible, fácil de depurar y escalable. No hay funciones monolíticas "Dios" y las dependencias fluyen en una sola dirección.

3. **Domain-Driven Design (DDD)**:
   - **Por qué**: El sistema está centrado en el "Dominio" (el Plan Único de Cuentas). Las entidades (`Account`) y reglas (`parent_code` no puede ser igual al `code`) tienen alta prioridad.
   - **Beneficio**: Refleja fielmente las reglas del negocio contable, haciéndolo más fácil de entender para los contadores y auditores.

4. **API Gateway / Facade Layer**:
   - **Por qué**: En lugar de conectar el frontend directamente con los servicios internos, se interpone una capa "Puerta de Enlace".
   - **Beneficio**: Centraliza la seguridad (autenticación), estandariza las respuestas (envuelve todo en `{success, data, error}`) y oculta la complejidad interna. Si mañana decides cambiar NestJS por otro framework, solo actualizas el Gateway sin romper la web.
