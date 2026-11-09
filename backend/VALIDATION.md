# Evidencia de validación — 9 de noviembre de 2026

Worktree: `../nexustech-codex-backend`. Rama: `feat/hito3-codex-backend`. Alcance de archivos: `backend/` y `docs/hito3/api-contract.md`; sin cambios en frontend, Compose o `backend/src/activity/`.

## Resultado final ejecutado

Entorno: Windows x64, Node.js 26.13.0, npm 11.20.0. PostgreSQL real iniciado para pruebas: `PostgreSQL 18.6 on x86_64-windows, compiled by msvc-19.44.35228, 64-bit`.

`npm test` terminó con código 0:

```text
tests 14
pass 14
fail 0
cancelled 0
skipped 0
duration_ms 12316.2115
```

El contador incluye el caso principal y 13 subpruebas. La ejecución compila TypeScript antes de probar HTTP. No usa mocks de persistencia. Comprueba:

- Migración inicial mediante CLI JavaScript, reversión y aplicación mediante CLI TypeScript sobre la misma base aislada.
- Salud con consulta SQL y disponibilidad de OpenAPI, incluidos esquemas de entrada y respuesta de pedidos.
- Validación de campos, rechazo de campos desconocidos, UUID y paginación/rangos inválidos.
- Registro, login, normalización y unicidad de email, perfiles y ausencia de contraseñas en respuesta.
- Propiedad de categorías/productos y restricciones FK al borrar categoría en uso.
- Búsqueda combinada con categoría y precios.
- Favoritos idempotentes y separados por usuario.
- Carrito: rechazo de producto propio, stock insuficiente y cantidad inválida.
- Checkout simultáneo con misma clave: un único pedido/descuento de inventario.
- Dos compradores compitiendo por última unidad: un 201 y un 409, stock final cero.
- Cancelación concurrente: un 200 y un 409, reposición exactamente una vez y simulación revertida.
- Compra fallida de varios productos: ningún pedido creado, inventario conservado y carrito intacto.
- Archivado: excluye el catálogo público y conserva detalles históricos de pedidos.
- JWT vencido/alterado devuelve 401; exceso de solicitudes de login devuelve 429.

Después de terminar se comprobó que no quedaban procesos `postgres.exe` de la prueba. La instancia usa E/S síncrona para evitar procesos de E/S huérfanos al finalizar PostgreSQL 18 en Windows. Esto afecta solamente al servidor de pruebas.

`npm audit` terminó con código 0 e informó `found 0 vulnerabilities`. Se fijaron overrides de `glob` y `minimatch` para corregir tres avisos moderados transitivos de TypeORM 0.3.31. No garantiza ausencia de vulnerabilidades futuras.

`git diff --check` terminó con código 0. Git muestra avisos informativos LF/CRLF por configuración de Windows.

## Errores encontrados y corregidos

1. La combinación de filtros sobrescribía el parámetro de búsqueda al pasar el DTO completo como parámetros SQL. Se cambió a parámetros específicos por condición y se verificó con HTTP.
2. El datasource tenía exportaciones duplicadas de la misma instancia. Se dejó una exportación default para compatibilidad con CLI TypeORM.
3. `ts-node` con TypeScript 6 necesitaba `types: ["node"]` explícito. Se ejecutó de nuevo el CLI real de migraciones después de corregirlo.
4. PostgreSQL 18 podía dejar un trabajador de E/S activo tras el cierre forzado de la biblioteca en Windows. La instancia aislada se configuró con `io_method=sync`; la última ejecución finalizó en 12,3 segundos y sin procesos PostgreSQL remanentes.

## Funcionalidades y endpoints

Implementados: autenticación JWT; perfiles comprador/vendedor; CRUD de categorías y productos/publicaciones con archivado; filtros/paginación; favoritos; carrito; pedidos transaccionales con snapshots, idempotencia y cancelación; transacciones simuladas; errores uniformes y Swagger. El [contrato](../docs/hito3/api-contract.md) enumera métodos y rutas de `/auth`, `/users/me`, `/categories`, `/products`, `/publications`, `/cart`, `/favorites`, `/orders` y `/health`, bajo `/api/v1`.

## Commits y estado remoto

El contrato se publicó primero en `4351312`; la implementación principal, en `e6a3e84`. Las correcciones de CLI, schemas OpenAPI, pruebas ampliadas y documentación se entregan en un commit posterior. Consultar `git log` para su SHA y el PR para la revisión actual. No se fusiona a main.

Archivos principales: `backend/src/{auth,catalog,users,cart,orders,common,database}/`, `app.module.ts`, `bootstrap.ts`, `main.ts`, `health.controller.ts`, `test/marketplace.test.cjs`, `package.json`, `package-lock.json`, `tsconfig.json`, `.env.example`, `.gitignore`, `README.md`, este informe y `docs/hito3/api-contract.md`.

## Límites y trabajo de integración pendiente

- No se comprobó una conexión al PostgreSQL de despliegue ni una integración React→API; se verificó HTTP→Nest→PostgreSQL real aislado→JSON.
- MongoDB/ActivityModule es responsabilidad del otro agente. Está documentado el punto de importación y los eventos posteriores al commit; su entrega es best effort y sin outbox.
- Deben configurarse credenciales reales, HTTPS, migraciones y origen CORS del entorno de demostración. No se publicó ningún secreto.
- Sin pagos/envíos reales, verificación de correo, recuperación de contraseña, MFA ni revocación inmediata de JWT. Rate limit local a la instancia.
- La suite usa binarios de desarrollo de embedded-postgres y un puerto fijo libre. No sustituye pruebas de carga, auditoría de seguridad ni validación visual del frontend.
- La revisión y fusión del PR quedan a cargo del equipo; no se modifican archivos asignados a otros agentes.

Uso de IA y referencias primarias: documentados en [README.md](README.md).
