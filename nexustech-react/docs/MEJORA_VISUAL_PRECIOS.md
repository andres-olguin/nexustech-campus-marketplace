# Parte 4 — Componentes visuales y precios

Base: commit `b9d4de9` de NexusTech Campus Marketplace. Los 99 archivos del ZIP recibido coincidieron con la copia del repositorio. La mejora se ejecuta en `nexustech-react/`.

## Demostración

1. Abrir `VISTA_PREVIA.html` después de descomprimir. Explorar el catálogo y reducir el ancho de la ventana para ver cómo cambian columnas, menú y filtros.
2. Pulsar **Publicar equipo** y crear una publicación de ejemplo. Agregarla al carrito. Desde su tarjeta, elegir **Editar precio**, guardar un nuevo valor y comprobar el importe en el carrito.
3. Con internet, elegir **CLP + USD**. La barra muestra la fuente y fecha de la referencia. Con el botón de actualizar se consulta de nuevo; si ya había una conversión, se conserva mientras llega la respuesta.

## Implementación

- `ProductCard` y `PriceDisplay` mantienen una estructura común para imágenes, precios y acciones. `catalog.css` usa Grid y media queries para tres, dos o una columna. Las imágenes mantienen sus proporciones sin recortar el producto.
- `EditPriceForm` valida pesos chilenos enteros entre $1.000 y $2.500.000. `useShop` actualiza la publicación local; el carrito usa el precio vigente del catálogo. Los pedidos ya confirmados conservan el importe registrado al comprarlos.
- `useExchangeRate` mantiene una solicitud activa como máximo. Recupera la última referencia válida al volver, evita consultar de nuevo durante 30 minutos salvo actualización manual y conserva el dato anterior si hay un error. La referencia guardada se recupera hasta siete días después de consultarla. Los valores de ejemplo nunca se usan como cotización de respaldo.
- El filtrado reutiliza el texto de búsqueda normalizado por producto y los formatos de moneda se crean una vez. El catálogo conserva la paginación de 24 productos.
- La compilación web carga las fotos por separado y las tarjetas solicitan sus imágenes según se necesitan. Con la misma versión de Vite, el JavaScript compilado pasó de **1.301,40 kB a 283,17 kB**, un **78 % menos** antes de comprimir. Esta cifra corresponde al JavaScript, no a todo el tráfico de la página. `npm run build:preview` incrusta las imágenes únicamente en la vista previa autónoma.

## Verificación

- `npm ci`, `npm test` (cuatro pruebas), `npm run build` y `npm run build:preview`.
- Chromium: edición inválida y válida, actualización en catálogo, favoritos y carrito, persistencia al recargar y conservación del importe de un pedido confirmado.
- Chromium: conversión con respuestas controladas, uso de la referencia guardada, actualización al vencer la caché, reintento sin duplicar solicitudes y conservación de la conversión ante un error HTTP.
- Anchos 1440, 1024, 768, 390 y 320 px: distribución esperada, controles de moneda visibles y ausencia de desplazamiento horizontal en el catálogo. Pruebas de búsqueda, presupuesto por teclado, orden por precio y menú móvil.
- `VISTA_PREVIA.html` se abrió desde el sistema de archivos en Chromium sin conexión. El catálogo, las imágenes, los estilos y la publicación funcionan en esa vista. La primera consulta USD necesita conexión.
- El endpoint real de mindicador.cl respondió HTTP 200 con una serie del dólar y CORS habilitado. Las comprobaciones del comportamiento de la interfaz ante respuestas lentas o fallidas se hicieron con respuestas controladas.
