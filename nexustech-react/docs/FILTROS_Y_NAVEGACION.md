# Parte 4 — Filtros técnicos y navegación de artículos

## Cómo mostrarlo

1. Abre `VISTA_PREVIA.html`. Escribe **notebook** en el buscador. Abre **Filtros → RAM** y elige una cantidad mínima. Los resultados se actualizan y el filtro aparece sobre las tarjetas.
2. Quita el filtro y cambia la búsqueda a **teclado**. Comprueba que los grupos de procesador y RAM desaparecen si los resultados no declaran esos datos.
3. Abre **Ver detalle** en el primer resultado. La flecha derecha pasa al siguiente; la izquierda aparece al avanzar. El contador indica la posición dentro de todos los resultados, no solo de la página visible. También funcionan las flechas del teclado cuando el foco está fuera de los campos de formulario.
4. Para probar campos con una publicación propia, usa **Publicar equipo → Datos para los filtros**. Añade marca, serie, tipo y, por ejemplo, “Intel Core i7-13700H, 16 GB RAM DDR5, SSD 512 GB, pantalla IPS 144 Hz”. La publicación se puede encontrar con esos filtros y los valores se ven en **Ficha técnica**.

## Cómo funciona

- `CatalogPage` obtiene la lista ordenada de resultados. `DetailNavigation` recorre esa lista sin cerrar el diálogo. Los extremos solo muestran la flecha disponible y un resultado único no muestra flechas.
- `productSpecs.js` obtiene los atributos a partir de los datos declarados. `facetCatalog` combina filtros y calcula cuántos productos coinciden con cada opción. Las cantidades mínimas incluyen valores mayores; el peso máximo incluye valores menores.
- Los grupos son General, Procesador, RAM, Pantalla, Tarjeta de video, Almacenamiento y Otros. Cada grupo aparece cuando hay atributos que se pueden filtrar. No se asignan valores técnicos a un producto solo para rellenar un selector. En los productos de ejemplo se descartan las especificaciones genéricas que no corresponden a la familia.
- Los filtros se combinan con presupuesto, orden y favoritos. Cambiar categoría limpia los filtros técnicos anteriores; quitar una etiqueta conserva la búsqueda.

## Comprobaciones

- Nueve pruebas con `npm test`, compilación web y regeneración de la vista previa.
- Chromium: navegación sin vuelta circular, extremos y resultado único; teclado y avance del artículo 24 al 25; fichas y filtros guardados en publicaciones propias.
- Pruebas en escritorio y en ventanas de 390 y 320 px para los nuevos controles. Las fotos se muestran en marcos de la misma proporción. También se verificaron nuevamente los precios, el carrito y la apertura de VISTA_PREVIA.html sin conexión.
