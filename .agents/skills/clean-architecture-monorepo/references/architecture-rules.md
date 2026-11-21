# Reglas y Principios de Arquitectura Limpia

## 1. Principio de Responsabilidad Única (SRP)
- **A nivel de Entidad**: La entidad `Account` es responsable de velar por sus propias invariantes (código numérico, longitud correspondiente a nivel, no vacíos, cálculo de naturaleza y de si admite movimientos).
- **A nivel de Caso de Uso**: En vez de un servicio monolítico gigante, cada caso de uso modela una intención del usuario:
  - `CreateAccountUseCase`: Solo se ocupa de la orquestación para crear una cuenta.
  - `DeleteAccountUseCase`: Solo se ocupa de validar que la cuenta exista, no tenga hijas y eliminarla.
  - `GetAccountTreeUseCase`: Solo se ocupa de estructurar el catálogo plano en un árbol jerárquico.

## 2. Inversión de Dependencias y Desacoplamiento de Persistencia (DIP)
- Los casos de uso dependen exclusivamente del puerto `AccountRepositoryPort` ubicado en la capa de dominio.
- Ninguna capa interna conoce si los datos están en memoria, SQLite, PostgreSQL, MongoDB o un API externo.
- Para cambiar de persistencia:
  1. Se crea un nuevo adaptador en `infrastructure/persistence/<motor>/<motor>-account.repository.ts`.
  2. Se cambia únicamente la configuración del módulo (`accounts.module.ts`), sustituyendo la clase proveedora en el token `ACCOUNT_REPOSITORY_TOKEN`.

## 3. Manejo de Excepciones de Dominio (Sin contaminar con HTTP)
- El dominio lanza subclases de `DomainException`.
- Nunca se lanza `HttpException`, `BadRequestException` o `ConflictException` dentro de `domain` ni dentro de `application`.
- Un filtro global (`DomainExceptionFilter`) en la capa de presentación intercepta estas excepciones y las traduce al código de estado HTTP adecuado:
  - `AccountAlreadyExistsException` -> `409 Conflict`
  - `ParentAccountNotFoundException` -> `422 Unprocessable Entity` o `400 Bad Request`
  - `AccountHasChildrenException` -> `400 Bad Request`
  - `InvalidAccountCodeException` -> `400 Bad Request`

## 4. Adaptabilidad para Monorepo
- La estructura permite separar fácilmente módulos a librerías compartidas si el monorepo crece:
  - `packages/domain`: Contratos puros y entidades compartidas entre frontend y backend (ej. interfaces DTO, enums de nivel y naturaleza).
  - `apps/api`: Servidor NestJS con adaptadores e infraestructura.
  - `apps/web`: Cliente React que puede reusar los enums y contratos de la capa compartida.

