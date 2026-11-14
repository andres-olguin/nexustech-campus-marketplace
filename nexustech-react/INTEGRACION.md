# Integración de la parte 4 de NexusTech

## Qué corresponde a la parte visual

La interfaz está en src/components, los estilos en src/styles y los recursos en src/assets. Las pantallas de src/pages conectan esos componentes.

useShop.js controla datos locales y acciones. publicApi.js y useExchangeRate.js concentran la integración HTTP. El equipo puede sustituirlos o modificarlos sin rediseñar las tarjetas.

## Si ya tienen un proyecto React

Copiar los componentes necesarios conservando sus rutas, junto con los estilos, recursos y utilidades que importan. ProductImage depende de src/data/imageAssets.js; ProductCard depende de src/utils/format.js.

Instalar Bootstrap e importar sus estilos antes del CSS propio:

    import 'bootstrap/dist/css/bootstrap.min.css';
    import './styles/styles.css';
    import './styles/catalog.css';

La pantalla debe estar dentro de un contenedor con className="nt-app". La implementación de referencia completa está en App.jsx.

## Contrato de producto

| Campo | Tipo |
| --- | --- |
| id | string único. |
| nombre | string. |
| categoria | Workstations, Hardware, Periféricos o Soluciones. |
| precio | number entero en CLP. |
| imagen | URL local generada por Vite, data URL o enlace HTTPS. |
| descripcion | string. |
| vendedor | string. |
| contacto | string para la demostración. |
| reseñas | array de usuario, rating y texto. |

Se conservan los nombres de campos del trabajo original para facilitar la transición. Los ids del catálogo se normalizan a strings.

## Props y callbacks principales

| Componente | Entrada | Acción |
| --- | --- | --- |
| ProductCard | product, favorite, usdRate opcional. | onFavorite(id), onDetail(product), onAdd(id), onDelete(product), onEditPrice(product) opcional para publicaciones propias. |
| ProductDetail | product, usdRate opcional. | onAdd(id, cantidad, acabado), onBuy(id, cantidad, acabado). |
| CartPanel | shop con carrito, total y acciones; usdRate opcional. | onCheckout(), onClose(). |
| PublishForm | user opcional. | onSave(values), onCancel(). |
| CheckoutForm | total, user opcional. | onConfirm(values), onCancel(). |
| Dialog | open, title, description, wide, drawer y children. | onClose() debe cambiar open a false. |
| Navbar | route, cartCount, favoriteCount y user. | onCart(), onPublish(). |
| Pagination | page y totalPages. | onChange(nuevaPagina). |
| Field | label, error, hint, as y props del control. | Recibe value y onChange del padre. |
| Alert | title, tone, children y action opcional. | onDismiss() opcional. |

## Datos de los formularios

PublishForm entrega nombre, categoria, precio, imagen, descripcion y vendedor. El controlador convierte precio a number y asigna un id.

CheckoutForm entrega nombre, email, direccion y ciudad. El controlador toma el carrito y guarda una copia de sus líneas y precios en el pedido.

La identidad de una línea del carrito usa id y acabado. Agregar otra variante del mismo producto genera otra línea.

## Presentación de la API

ExchangeRatePanel recibe exchange con status, rate, error y load(). rate contiene value, date y source.

Las tarjetas reciben usdRate solo cuando existe una respuesta válida y el usuario eligió ver la referencia. Los totales del pedido siempre usan CLP.

La interfaz incluye estados idle, loading, success y error. La implementación real de la consulta está en publicApi.js. La persona responsable de la API debe revisar su documentación y condiciones actuales.

## Coordinación sugerida

| Área | Archivos a coordinar |
| --- | --- |
| Diseño, navegación y arquitectura | App.jsx, pages, Navbar y docs/DISENO.md. |
| Datos y funciones | useShop.js, data y validaciones de formularios. |
| API | publicApi.js, useExchangeRate.js y ExchangeRatePanel. |
| Parte 4: componentes y responsive | ProductCard, PriceDisplay, ui, layout, assets, styles.css y catalog.css. |

Integrar las funciones reales mediante los callbacks, revisar las pantallas completas y ejecutar npm run build. Registrar las contribuciones efectivas con commits y Pull Requests del equipo.
