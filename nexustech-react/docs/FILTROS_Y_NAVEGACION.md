# Parte 4 — Filtros técnicos y navegación de artículos

## Cómo mostrarlo

1. Abre `VISTA_PREVIA.html`. Escribe **notebook** en el buscador. Abre **Filtros → RAM** y elige una cantidad mínima. Los resultados se actualizan y el filtro aparece sobre las tarjetas.
2. Quita el filtro y cambia la búsqueda a **teclado**. Comprueba que los grupos de procesador y RAM desaparecen si los resultados no declaran esos datos.
3. Abre **Ver detalle** en el primer resultado. La flecha derecha pasa al siguiente; la izquierda aparece al avanzar. El contador indica la posición dentro de todos los resultados, no solo de la página visible. También funcionan las flechas del teclado cuando el foco está fuera de los campos de formulario.
4. Para probar campos con una publicación propia, usa **Publicar equipo → Datos para los filtros**. Añade marca, serie, tipo y, por ejemplo, “Intel Core i7-13700H, 16 GB RAM DDR5, SSD 512 GB, pantalla IPS 144 Hz”. La publicación se puede encontrar con esos filtros y los valores se ven en **Ficha técnica**.
5. Abre **Computación → Teclados → Mecánicos** para mostrar la navegación por departamentos. En celular, el menú está en **Categorías**. Prueba **ElectroHogar → Refrigeradores → Top Freezer** para ver el mensaje **No hay productos relacionados a esto** cuando no hay publicaciones.
6. En **Computación → RAM → DDR4 Desktop**, elige **Capacidad total mínima: 16 GB** y **Velocidad mínima: 3.200 MT/s**. Después entra en **Computación → Tarjetas de video → NVIDIA GeForce** para mostrar la diferencia entre RAM y VRAM.

## Cómo funciona

- `CatalogPage` obtiene la lista ordenada de resultados. `DetailNavigation` recorre esa lista sin cerrar el diálogo. Los extremos solo muestran la flecha disponible y un resultado único no muestra flechas.
- `productSpecs.js` obtiene los atributos a partir de los datos declarados. `facetCatalog` combina filtros y calcula cuántos productos coinciden con cada opción. Las cantidades mínimas incluyen valores mayores; el peso máximo incluye valores menores.
- `filterProfiles.js` define los grupos de cada artefacto. La sección seleccionada, una búsqueda que reconoce el tipo o el selector **Tipo de producto** determinan qué grupos mostrar. Si la búsqueda mezcla familias, el panel ofrece filtros generales. Un campo aparece cuando hay datos para filtrar o se necesita quitar un valor seleccionado.
- Las fichas de RAM y GPU incluidas para demostrar la función son ficticias. En publicaciones propias, un campo sin datos declarados se omite. Por ejemplo, **3DMark Time Spy** aparece si se escribió un puntaje en la ficha.
- Los filtros se combinan con presupuesto, orden y favoritos. Cambiar categoría limpia los filtros técnicos anteriores; quitar una etiqueta conserva la búsqueda.
- `DepartmentMenu` presenta familias y subcategorías de `departments.js`. El enlace conserva la sección seleccionada al recargar; el catálogo combina esa sección con el texto y los demás filtros. Las familias sin publicaciones permanecen accesibles.

## Comprobaciones

- Pruebas de filtros, navegación, compilación web y regeneración de la vista previa con `npm test`, `npm run build` y `npm run build:preview`.
- Chromium: navegación sin vuelta circular, extremos y resultado único; teclado y avance del artículo 24 al 25; fichas y filtros guardados en publicaciones propias.
- Pruebas en escritorio y en ventanas de 390 y 320 px para los nuevos controles. Las fotos se muestran en marcos de la misma proporción. También se verificaron nuevamente los precios, el carrito y la apertura de VISTA_PREVIA.html sin conexión.
