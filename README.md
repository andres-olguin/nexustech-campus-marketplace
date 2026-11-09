# NexusTech Campus Marketplace — Proyecto académico web

**Prototipo de marketplace para la comunidad estudiantil**, concebido como trabajo de Desarrollo Web y Móvil. Explora catálogo de productos tecnológicos, filtros y una interfaz de carrito simulado. No hay evidencia de un marketplace comercial en operación ni de un convenio con la Universidad Andrés Bello.

> **Estado:** laboratorio web con versiones HTML/JavaScript y React/Vite coexistentes. Algunas páginas heredadas todavía están vacías: no deben presentarse como funciones terminadas.

## Qué existe en este repositorio

| Recurso | Estado |
|---|---|
| [`index.html`](index.html) | Interfaz histórica HTML |
| [`nexustech-react/`](nexustech-react/) | Proyecto React con Vite y Bootstrap |
| [`App.jsx`](App.jsx), [`useLogica.js`](useLogica.js) | Experimentos React en raíz |
| [`data.js`](data.js), [`js/`](js/) | Catálogo y lógica de demostración |
| [`carrito.html`](carrito.html) | Archivo **vacío** en la revisión realizada |
| [`historial.html`](historial.html) | Archivo **vacío** en la revisión realizada |
| [`docs/`](docs/) | Estudio técnico y evolución del prototipo |

**Importante:** no se ha definido todavía cuál de los frontends es canónico. No mezclar los ejemplos de raíz con la app Vite sin revisar sus dependencias.

## Arranque del proyecto React

Para probar la mejora de **componentes visuales y precios**, abre [la vista previa](nexustech-react/VISTA_PREVIA.html) después de descargar y descomprimir el proyecto. El catálogo React incluye un menú de departamentos con subcategorías, filtros técnicos, edición de precios, controles CLP/USD y navegación entre artículos desde el detalle.

El [package.json](nexustech-react/package.json) declara React 19, Vite 7 y Bootstrap 5. Requiere Node.js `^20.19.0` o `>=22.12.0`.

```bash
cd nexustech-react
npm ci
npm run dev
```

El servidor de Vite muestra una URL local al iniciar. También puedes revisar el HTML histórico con un servidor estático, pero **eso no inicia automáticamente la variante React**.

## Alcance y limitaciones

- El carrito y las fichas del catálogo se consideran **demostraciones**, no compras ejecutadas.
- No se han verificado pagos, autenticación, envíos ni persistencia de operaciones reales.
- No introducir datos personales de estudiantes en demos sin autorización.
- El nombre UNAB corresponde al contexto académico y **no implica asociación institucional formal**.

## Evolución priorizada

1. Elegir un único frontend y documentar migración de componentes.
2. Reparar páginas vacías y enlaces, o eliminarlas del menú público.
3. Probar filtros, búsqueda, carrito simulado y estados de error con datos sintéticos.
4. Revisar accesibilidad, rendimiento móvil, moderación y derechos de contenido.
5. Validar con usuarios antes de añadir cuentas, pagos, logística y backend.

[Plan de ingeniería](docs/ENGINEERING_ROADMAP_2026-11-04.md) · [Estrategia de escalabilidad](docs/ARCHITECTURE_SCALABILITY_2026-11-04.md).

**Autoría:** conservar créditos y licencias de los colaboradores del trabajo académico; no asumir explotación comercial automática.
