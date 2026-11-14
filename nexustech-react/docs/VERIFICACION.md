# Verificación de NexusTech en React

Para las comprobaciones de la versión actualizada, ver [Mejora visual y de precios](MEJORA_VISUAL_PRECIOS.md). Lo que sigue registra la primera versión del taller.

Fecha de revisión: 11 de octubre de 2026.

## Compilación y vista previa

- Compilación de producción completada con npm run build, Node.js 24 y Vite 7.3.7.
- VISTA_PREVIA.html contiene la aplicación compilada, sus estilos y fotografías locales.
- La navegación y el catálogo funcionan al abrir el archivo después de descomprimir.
- No se hacen consultas a la API hasta pulsar Ver referencia USD.
- Vite advierte del tamaño del JavaScript porque las fotografías están incrustadas para disponer de una vista previa autónoma.

## Continuidad del Taller 1

Se compararon los 2.400 productos con el generador original: coinciden id, nombre, categoría, precio y vendedor. Se conserva la paginación de 24 productos.

Los ocho archivos de base-taller1 se compararon byte por byte con los archivos recibidos: no tienen modificaciones. Sirven como referencia; el proyecto React de la raíz es la aplicación ejecutable.

## Diseño responsive

Se revisaron catálogo, favoritos, rastreo, contacto, acceso y el formulario de publicación en Chromium. No se detectó desbordamiento horizontal en estos anchos:

| Ancho | Columnas del catálogo | Navegación |
| --- | --- | --- |
| 1.440 px | 3 | Enlaces visibles. |
| 1.024 px | 2 | Enlaces visibles. |
| 768 px | 2 | Menú desplegable. |
| 390 px | 1 | Menú desplegable. |
| 320 px | 1 | Menú desplegable. |

También se comprobaron nombres de producto de 149 caracteres y responsables de 80 caracteres en tarjetas, detalle y carrito a 320 px. Se revisaron visualmente capturas de escritorio, celular, publicación y rastreo.

## Funciones comprobadas

- Búsqueda sin distinguir tildes, filtros, orden de precios, presupuesto, paginación y estados vacíos.
- Favoritos y carrito persistentes, con cantidades, subtotales, eliminación y líneas separadas por acabado.
- Publicación validada, eliminación con confirmación y opción de deshacer que recupera también el carrito y los favoritos.
- Pedido simulado: validación del despacho, código de seguimiento, carrito vacío al confirmar y rastreo de la orden creada.
- Guía original 9876543210, avance simulado de estados, persistencia y error para un código desconocido.
- Acceso y contacto de demostración con validación; la contraseña no se guarda y el texto ingresado se muestra sin interpretarlo como HTML.
- Restauración de datos con cancelación y confirmación.
- Foco en el primer campo inválido, navegación por teclado dentro del diálogo, bloqueo del fondo y cierre con Escape.
- Salto al contenido sin cambiar de pantalla.
- Aviso y funcionamiento durante la sesión cuando el navegador bloquea localStorage.

No se registraron excepciones de JavaScript ni errores inesperados de consola durante las pruebas funcionales.

## API y alcance de la prueba

La consulta HTTP real a https://mindicador.cl/api/dolar respondió 200. Se comprobó codigo igual a dolar, serie con fechas y valores válidos, y el encabezado Access-Control-Allow-Origin con valor *.

El registro más reciente recibido durante la revisión fue:

| Campo | Valor |
| --- | --- |
| fecha | 2026-10-09T03:00:00.000Z |
| valor | 981,61 CLP por USD |

Para revisar la interfaz de forma reproducible se utilizaron respuestas controladas: carga, respuesta válida, conversión, cambio de moneda, error HTTP 503, serie vacía y reintento. Estas respuestas se usaron solo en las pruebas; no hay una tasa de respaldo inventada en la aplicación.

La consulta real desde el navegador automatizado no se completó en este entorno y mostró el mensaje de timeout y reintento. La verificación HTTP del endpoint y la prueba de estados de la interfaz son comprobaciones separadas. La consulta desde el navegador del equipo depende de su conexión y de la disponibilidad del proveedor.

## Alcance de la revisión

Las comprobaciones de interfaz se hicieron en Chromium y con tamaños de ventana; no sustituyen una revisión en dispositivos físicos o en otros navegadores. El paquete no acredita commits, ramas ni Pull Requests del equipo. Antes de la exposición, cada integrante debe revisar el código que explicará y registrar sus contribuciones reales.
