# NexusTech Store · Campus Hub UNAB (Hito 3 Full Stack)

Integración completa entre frontend React 19 y backend canónico NestJS 11 con persistencia relacional en PostgreSQL y TypeORM, preparada para el Hito 3.

## Integrantes

- Miguel Margas
- Enrique Chamys
- Maximiliano Valdés
- Andrés Olguín

## Arquitectura del Sistema

El sistema implementa una arquitectura desacoplada full stack:
- **Frontend:** React 19 + Vite 6 + Vanilla CSS / Bootstrap 5 responsive.
- **Backend canónico:** NestJS 11 (`feat/hito3-codex-backend`, commit `7c72034`, PR #4), modularizado con TypeORM, validación estricta con `class-validator`, y autenticación JWT.
- **Base de Datos Relacional:** PostgreSQL (migraciones TypeORM, transacciones ACID para pedidos y control de concurrencia en stock).
- **Base de Datos Documental (Pendiente de integración):** MongoDB (prevista para `ActivityModule`/historial de auditoría).

## Variables de Entorno Frontend

En `nexustech-react/`:
- `VITE_API_BASE_URL`: URL base del API NestJS (por defecto: `http://localhost:3000/api/v1`).
- `VITE_PUBLIC_DOLLAR_URL`: Endpoint para cotización referencial USD (mindicador.cl).

Copiar desde `.env.example` si se requiere modificar el puerto del API:
```bash
cp .env.example .env
```

## Ejecución del Proyecto

### 1. Iniciar Backend (NestJS + PostgreSQL)
Desde el directorio del backend (`backend/`):
```bash
npm install
npm run build
npm run typeorm:run-migrations
npm run start:dev
```
- API Base: `http://localhost:3000/api/v1`
- Swagger UI: `http://localhost:3000/docs`

### 2. Iniciar Frontend (React)
Desde el directorio `nexustech-react/`:
```bash
npm install
npm run dev
```
Acceder a `http://localhost:5173`.

### 3. Compilación de Producción
```bash
npm run build
npm run preview
```

## Pruebas Automatizadas

El proyecto cuenta con un conjunto de pruebas automatizadas reproducibles:

### Pruebas Unitarias del Cliente HTTP y Validadores
Ejecución:
```bash
npm test
```
**Resultado:** 12/12 pruebas aprobadas (`test/api.test.js`):
- Validación de URLs base y normalización de endpoints.
- Manejo canónico de errores HTTP (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 503 Service Unavailable).
- Limpieza automática de credenciales JWT al recibir 401.
- Rechazo estricto ante respuestas incompatibles (evita catálogos fantasma).
- Inyección de headers de autorización `Bearer <token>`.
- Generación de claves de idempotencia UUID v4 (`x-idempotency-key`) en checkout.

### Pruebas End-to-End en Navegador Real (Playwright)
Ejecución:
```bash
npm run test:e2e
```
El script automatizado `scripts/run-integration.cjs`:
1. Levanta una instancia aislada de PostgreSQL 18 en puerto efímero.
2. Compila y ejecuta las migraciones TypeORM del backend NestJS.
3. Inicia la API NestJS en puerto efímero.
4. Inicia el servidor de preview de Vite.
5. Ejecuta la suite de Playwright en Chromium real.

**Resultado:** 5/5 suites aprobadas:
1. `marketplace flow: register -> publish/edit -> favorites/cart -> multi-seller order -> tracking/cancel -> relogin persistence`: Verifica el ciclo completo con usuarios sintéticos compradores y vendedores.
2. `responsive navigation: desktop and mobile layout adapts correctly`: Prueba renderizado a 390px y 768px.
3. `checkout retry: lost response retries same real committed order without double purchase`: Idempotencia real comprobada.
4. `session invalidation: 401 clears authenticated state without retention`: Cierre seguro de sesión.
5. `api failure: unavailable backend displays error message without mock fallback`: Fallback seguro ante caídas del backend.

## Flujos Operativos Verificados
- [x] Registro y autenticación JWT de compradores y vendedores.
- [x] Consulta y filtrado de catálogo desde base de datos PostgreSQL real.
- [x] Publicación, edición y eliminación de productos por vendedor autorizado.
- [x] Gestión de carrito persistente y sincronizado con stock.
- [x] Lista de favoritos persistente por usuario.
- [x] Checkout transaccional con clave de idempotencia y cálculo seguro de totales en servidor (sin almacenamiento de tarjetas).
- [x] Descuento atómico de stock.
- [x] Consulta de órdenes y actualización de estados por el vendedor responsable.
- [x] Persistencia de sesión tras recarga y re-login.

## Aspectos de Seguridad y Calidad
- **Tokens JWT:** Almacenamiento en memoria/estado de sesión, eliminación inmediata ante 401.
- **Sin Datos Sensibles de Pago:** El checkout no solicita ni persiste números de tarjeta ni CVV en frontend o base de datos.
- **Validación de Identidad:** La autorización se basa estrictamente en el token JWT verificado por el servidor; no se envía ni confía en cabeceras inseguras como `x-user-id`.
- **Integridad de Datos:** No se recurre a catálogos simulados cuando la API está fuera de servicio; se presentan alertas informativas con opción de reintento.

## Limitaciones y Deuda Técnica
- **MongoDB / ActivityModule:** No está integrado en el flujo principal del backend NestJS ni en las vistas del frontend (la vista de interacciones en React muestra el estado de espera para cuando el backend exponga los endpoints de MongoDB).
- **Docker Compose:** La verificación local se realizó con procesos Node/PostgreSQL embebidos debido a restricciones de Docker Desktop en el entorno de desarrollo.

## Declaración de Uso de IA
- **Herramientas:** Antigravity Flash / Gemini 2.5 / Codex.
- **Alcance:** Diagnóstico de compatibilidad contractual HTTP, corrección de codificación UTF-8 BOM en scripts de prueba, implementación de suite de integración E2E con Playwright, y documentación técnica de entrega.
