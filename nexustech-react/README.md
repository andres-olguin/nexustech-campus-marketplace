# NexusTech Store · Campus Hub UNAB

Taller Evaluado 2: adaptación a React del marketplace de hardware y soluciones informáticas del Taller Evaluado 1. Esta entrega continúa los archivos proporcionados y desarrolla la parte visual en componentes reutilizables, con una aplicación funcional para demostrarlos.

## Integrantes

Nombres tomados del README del Taller 1:

- Miguel Margas.
- Enrique Chamys.
- Maximiliano Valdés.
- Andrés Olguín.

La distribución definitiva y las contribuciones efectivas deben registrarse en el repositorio del equipo.

## Problemática y usuarios

Las publicaciones de tecnología se dispersan entre grupos de mensajería y redes sociales. NexusTech reúne un catálogo que permite buscar, filtrar, guardar productos y simular una compra con seguimiento.

Los usuarios objetivo son estudiantes y miembros de la comunidad universitaria interesados en hardware, periféricos, equipos de trabajo y soluciones informáticas.

## Continuidad con el primer trabajo

Se conservan NexusTech, Campus Hub UNAB, la identidad oscura con cian, las cuatro categorías, los precios en CLP y la combinatoria original de 2.400 productos, con 24 por página.

El código que antes creaba HTML con innerHTML pasa a componentes React y renderizado de listas con keys. Los formularios, el carrito y los favoritos se conectan mediante props y callbacks. Acceso, contacto y rastreo se unifican con la tienda; los archivos recibidos de acceso y contacto todavía tenían textos de VetConnect.

Los originales están en base-taller1, sin modificaciones, como referencia. La aplicación ejecutable es la de la raíz y src. docs/MIGRACION.md muestra las correspondencias.

## Funcionalidades

- Catálogo, búsqueda sin distinguir tildes, categorías, presupuesto, orden y paginación.
- Menú de departamentos y subcategorías que se combina con la búsqueda y los filtros técnicos.
- Filtros técnicos por tipo de producto, con valores y conteos que se actualizan según los resultados.
- Tarjetas reutilizables, detalle, reseñas de ejemplo y selección de cantidad y acabado.
- Detalle con ficha técnica y flechas para recorrer los productos de la búsqueda.
- Favoritos con su propia pantalla.
- Carrito por producto y acabado, ajuste de cantidades y totales.
- Publicación validada, edición rápida de su precio, eliminación con confirmación y opción de deshacer.
- Pedido simulado con datos de despacho y código de seguimiento.
- Rastreo del pedido creado, guía original 9876543210 y avance simulado de estados.
- Acceso y perfil locales; formulario de contacto que registra consultas de demostración.
- Persistencia local de publicaciones, favoritos, carrito, pedidos, perfil y consultas.
- Referencia USD mediante una API pública, con reutilización del último dato válido.
- Navegación y formularios adaptables a computadora, tableta y celular.

## Ejecución

Para ver la demostración sin instalar, abrir VISTA_PREVIA.html en un navegador actualizado. Las imágenes y estilos están incluidos. La función de referencia USD necesita internet.

Para editar, usar Node.js 22.12 o posterior de la rama 22, o Node.js 24. Abrir esta carpeta en Visual Studio Code y ejecutar:

    npm ci
    npm run dev

Abrir la dirección que muestra Vite. Para comprobar y visualizar la compilación:

    npm run build
    npm run preview

Ejecuta `npm test` para comprobar filtros y validación de la referencia USD, y `npm run build:preview` para regenerar VISTA_PREVIA.html después de editar el código.

## Cambiar un precio

1. Crea una publicación con **Publicar equipo**.
2. Pulsa **Editar precio** en su tarjeta, escribe el nuevo importe en CLP y elige **Guardar precio**.
3. Comprueba el nuevo importe en el catálogo o en el carrito si el producto ya estaba agregado.

El cambio se guarda en este navegador y se mantiene al recargar. El precio de los pedidos ya confirmados queda registrado en el pedido.

## Filtrar y recorrer el catálogo

En computadora, elige un departamento en la barra superior. En celular, abre **Categorías**. Por ejemplo, **Computación → Teclados → Mecánicos** filtra el catálogo a ese tipo de artículo. **Ver todos** muestra toda la familia, y la ruta que aparece sobre los resultados permite volver a una categoría más amplia.

El catálogo muestra **No hay productos relacionados a esto** cuando la búsqueda o los filtros no tienen coincidencias. Los departamentos sin publicaciones siguen disponibles en el menú. Si publicas un producto, indica el tipo y las características en **Datos para los filtros** para que aparezca en las secciones correspondientes.

Busca **memoria RAM**, **RTX 4060** o **notebook** y abre **Filtros**. También puedes elegir **Tipo de producto** o entrar por el menú de departamentos. En **Computación → RAM → DDR4 Desktop**, el panel permite seleccionar capacidad, formato, frecuencia, voltaje y latencia. En **Computación → Tarjetas de video → NVIDIA GeForce**, cambia a GPU, VRAM, arquitectura, bus y largo.

Cada selector ofrece los valores que tienen datos entre los resultados. Al pasar a otro tipo de producto, se quitan los filtros técnicos del anterior. Puedes quitar un criterio pulsando su etiqueta.

Abre **Ver detalle** y usa las flechas para pasar al artículo anterior o siguiente sin cerrar la ventana. El recorrido respeta los filtros y el orden, incluso cuando el siguiente artículo está en otra página. En el formulario de publicación puedes añadir datos técnicos opcionales para que el producto aparezca en más filtros.

Ver [Filtros y navegación](docs/FILTROS_Y_NAVEGACION.md).

Se utilizó Node.js 24 para la preparación. package-lock.json conserva las versiones resueltas.

## Organización

| Carpeta o archivo | Responsabilidad |
| --- | --- |
| src/components/ui | Botones, campos, precios, mensajes, tarjetas, diálogo, imágenes e íconos. |
| src/components/layout | Cabecera, navegación y pie común. |
| src/components/catalog | Tarjeta de producto, filtros, paginación, presentación y referencia USD. |
| src/components/shop | Detalle, carrito, publicación, edición de precio y pedido. |
| src/pages | Catálogo, favoritos mediante CatalogPage, rastreo, contacto y acceso. |
| src/hooks/useShop.js | Estado y acciones locales de la tienda. |
| src/hooks/useHashRoute.js | Navegación por hash y respuesta a atrás/adelante. |
| src/hooks/useExchangeRate.js | Solicitud USD, actualización y conservación del último dato válido. |
| src/hooks/useValidatedForm.js | Valores, validación y foco compartidos entre formularios. |
| src/services/publicApi.js | Fetch, validación de la respuesta y timeout. |
| src/data | Configuración original del catálogo, generador, pedido inicial y departamentos. |
| src/assets | Fotografías locales, ilustración de respaldo y recursos propios. |
| src/styles | Identidad común en styles.css; catálogo y precios en catalog.css; menú adaptable en departments.css. |
| docs | Diseño previo, wireframes, migración y verificación. |
| GUIA_PARTE_4.md | Guion y explicación para estudiar. |
| INTEGRACION.md | Props, contratos y coordinación con el equipo. |

App.jsx conecta vistas, controlador y ventanas. Bootstrap se importa antes del CSS propio. Se usa su CSS para controles y utilidades; la apertura de ventanas y las interacciones se gestionan con React.

## Datos y persistencia

catalogConfig.json conserva los datos de generación del main.js original. createProducts produce los 2.400 objetos iniciales; no se insertan todos en el DOM a la vez. Las memorias RAM y las tarjetas de video de la demo usan fichas ficticias por tipo para probar los filtros.

useShop conserva en localStorage, bajo nexustech-react-v2, las publicaciones añadidas, las eliminaciones, los favoritos, las líneas del carrito, los pedidos, el perfil y las consultas. El catálogo inicial se vuelve a generar y no se duplica completo en el almacenamiento.

La contraseña de ejemplo solo valida el formulario y no se guarda. Las ventanas, filtros y avisos son estados temporales. Los avisos normales se cierran automáticamente; el aviso que permite deshacer permanece hasta que se realiza otra acción o se cierra.

Si el navegador bloquea el almacenamiento, aparece un mensaje y la aplicación funciona durante la sesión. Restaurar demostración requiere confirmar y solo restablece los datos de este proyecto.

## API pública

| Elemento | Implementación |
| --- | --- |
| Nombre | Indicadores económicos diarios de mindicador.cl. |
| Sitio y referencia oficial | https://mindicador.cl |
| Endpoint | https://mindicador.cl/api/dolar |
| Método | GET. |
| Parámetros | Ninguno. |
| Clave o autenticación | La consulta pública utilizada no requirió una clave. |
| Respuesta usada | codigo y los campos valor y fecha de serie. |
| Selección | Registro válido con fecha más reciente. |
| Aporte | Comparar precios de hardware en CLP con una referencia aproximada en USD. |
| Cálculo | Precio CLP dividido por el valor CLP de un USD. |
| Ubicación | Barra de moneda del catálogo, tarjetas, detalle y total del carrito. |
| Carga | El selector muestra la actualización y conserva la conversión anterior si ya existe. |
| Error | Mensaje y reintento; se mantienen los precios CLP y la última referencia válida si existe. |
| Timeout | Ocho segundos. |
| Consulta | CLP + USD reutiliza la referencia consultada hace menos de 30 minutos; el botón de actualizar fuerza una consulta. No hay sondeo automático ni solicitudes simultáneas. |
| Persistencia | La última referencia válida se conserva en localStorage y se recupera hasta siete días después de su consulta. Se muestra la fecha original del dato. |
| Atribución | Enlace visible a mindicador.cl y fecha del dato. |

El dato se identifica con su fecha; no se presenta como una cotización instantánea. El pedido siempre se calcula en CLP. No se utiliza una tasa inventada si falla la consulta.

La consulta y su respuesta se verificaron durante la preparación. El sitio principal devolvió un error en ese momento, aunque el endpoint respondió. No se pudo confirmar una cuota ni una licencia de reutilización específica; la persona responsable de la API debe revisar las condiciones del proveedor antes de la entrega definitiva. Los detalles de las pruebas están en docs/VERIFICACION.md.

## Diseño previo y parte 4

docs/DISENO.md define la navegación, jerarquía, flujos, componentes y criterios visuales antes de la implementación de esta adaptación. Los wireframes muestran catálogo y celular.

La persona 4 puede centrarse en ProductCard, Button, Field, Dialog, Navbar, los recursos locales y las media queries. El controlador de la tienda y el servicio de API se incluyen para que la interfaz pueda demostrarse y conectarse con el trabajo de los otros integrantes.

## Uso de Inteligencia Artificial

- Herramienta: ChatGPT.
- Propósito: adaptar el trabajo original a React, proponer componentes y estilos responsive, conectar una demostración funcional, revisar errores y preparar documentación.
- Consultas representativas: «Hace la parte 4», «Quiero que lo mejores» y el pedido de trabajar sobre los archivos del primer taller.
- Resultado: proyecto, vista previa, recursos organizados, diseño, guía e integración.
- Revisión durante la preparación: comparación del catálogo con el generador original, compilación y pruebas visuales y funcionales.
- Modificación humana: completar con las adaptaciones y correcciones que efectivamente realice cada integrante.
- Aprendizaje: completar después de estudiar qué hacen los componentes, props, estados, callbacks y efectos utilizados.

No atribuir al equipo revisiones, commits o decisiones que todavía no realizó. La defensa requiere comprender el código que se presente.

## Límites de la demostración

Los productos y reseñas son datos simulados del trabajo original. No hay verificación real de hardware ni garantías comerciales. Compra, seguimiento, sesión y contacto son demostraciones locales: no hay cobros, envío físico, verificación de credenciales ni envío de correos.

La persistencia corresponde a este navegador y no se sincroniza entre personas o equipos. La referencia USD depende de la conexión y del proveedor. La compilación web carga las fotografías como recursos separados; la vista previa autónoma las incrusta para abrirse sin conexión.

## Git y colaboración

Integrar esta carpeta en el repositorio del equipo, utilizando develop y una rama feature/componentes-nexustech. Hacer commits descriptivos durante la adaptación y abrir un Pull Request hacia develop. La integración final a main corresponde al equipo.

Este paquete no crea ni acredita commits o Pull Requests de los integrantes.

## Referencias técnicas

- [React: props y children](https://react.dev/learn/passing-props-to-a-component)
- [React: efectos](https://react.dev/learn/synchronizing-with-effects)
- [Bootstrap: breakpoints](https://getbootstrap.com/docs/5.3/layout/breakpoints/)
- [Vite](https://vite.dev/guide/)
- [Diálogo nativo](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal)
- [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
