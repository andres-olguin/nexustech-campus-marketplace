# NexusTech · Frontend del Hito 3

La entrada activa es `index.html` → `src/main.jsx` → `App.jsx`. Sigue la identidad y los componentes React del Taller 2. Para iniciar los servicios juntos, seguí [el paso a paso de la raíz](../DOCKER.md).

La aplicación consulta NestJS con el cliente HTTP de `src/services/nestApi.js`. Las cuentas, publicaciones, precios, carrito y pedidos se consultan en la API. Los tokens se mantienen en memoria; al recargar se vuelve a iniciar sesión. El único dato guardado por la versión conectada en `localStorage` es la referencia pública de cambio CLP/USD. Las 240 fichas demostrativas están etiquetadas y separadas del catálogo que permite comprar.

- `CatalogPage.jsx` combina búsqueda, categoría, tipo, características y presupuesto. El servidor ordena y filtra antes de paginar. Las flechas de un detalle respetan los filtros.
- `PublishForm.jsx` permite declarar el tipo y especificaciones; `EditPriceForm.jsx` cambia solo el precio mediante PATCH. Se conserva el precio de los pedidos existentes.
- La ficha de una publicación de otro vendedor permite enviar una consulta a MongoDB mediante el backend. La vista Actividad deja consultar las conversaciones desde la cuenta que participa.
- El selector CLP/USD usa Mindicador con carga, aviso de error y última referencia válida. La compra se calcula siempre en CLP.

```powershell
npm ci
npm test
npm run build
```

Para desarrollo local, copiá `.env.example` a `.env` de esta carpeta y apuntá `VITE_API_BASE_URL` a un backend ya iniciado; el Compose configura esa URL automáticamente. `npm run test:e2e` crea su propio entorno temporal: requiere dependencias del backend y Chromium de Playwright.

Los archivos `VISTA_PREVIA.html`, `base-taller1/` y guías de la parte 4 documentan las versiones anteriores.
