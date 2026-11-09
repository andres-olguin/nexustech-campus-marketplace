# Guía para explicar la parte 4 de NexusTech

## Qué revisar primero

1. ProductCard.jsx: datos del producto y funciones recibidas por props.
2. Button.jsx: texto con children, ícono y variante.
3. Field.jsx: etiqueta, control y mensaje de error.
4. Navbar.jsx: enlaces y menú de celular.
5. catalog.css: distribución del catálogo, precios y media queries; styles.css conserva los estilos comunes.
6. CatalogPage.jsx: cómo reúne tarjetas, filtros y paginación.

Dialog.jsx permite mostrar detalle, publicación y carrito. useShop.js pertenece al controlador que conecta las acciones.

## Guion de aproximadamente un minuto

Adaptá este texto a lo que realmente hayas revisado y modificado:

«Mi parte es la presentación visual y el diseño responsive de NexusTech.

Continuamos la tienda del primer taller, conservando el nombre, los colores y las categorías. La diferencia es que la interfaz ahora está organizada en componentes React.

Por ejemplo, ProductCard muestra cada producto con su imagen, categoría, vendedor, precio y botones. Recibe esos datos mediante props. También recibe funciones para agregar al carrito o guardar un favorito.

Los botones, campos, mensajes y ventanas son reutilizables. Esto ayuda a mantener el mismo diseño en catálogo, acceso, contacto y rastreo.

Los estilos están en un archivo CSS y los recursos están organizados en assets. En computadora se ven tres columnas de productos; en tableta dos y en celular una. El menú y los filtros también se adaptan.

Para demostrar los componentes, usamos un controlador de datos separado. La tarjeta llama a una función y React actualiza la pantalla cuando cambia el estado».

## Demostración de tu parte

| Paso | Qué mostrar | Qué explicar |
| --- | --- | --- |
| 1 | Dos productos del catálogo. | Comparten ProductCard con datos diferentes. |
| 2 | Pulsar un corazón y abrir Favoritos. | La tarjeta invoca onFavorite; el padre actualiza el estado. |
| 3 | Abrir un detalle y agregar un producto. | Dialog se reutiliza y CartPanel presenta el resultado. |
| 4 | Abrir Publicar y enviar el formulario vacío. | Field muestra los errores y el foco va al primer campo inválido. |
| 5 | Reducir el ancho de la ventana. | Cambian columnas, menú y filtros. |
| 6 | Editar el precio de una publicación propia. | El formulario valida el importe y el controlador actualiza catálogo y carrito. |
| 7 | Abrir contacto y rastreo. | Se conserva una identidad visual común. |

Para mostrar el flujo completo del equipo, agregar un producto, abrir el carrito, completar el despacho con datos de ejemplo y pulsar Confirmar pedido simulado. El código generado puede consultarse en Rastreo.

Elige **CLP + USD** en la barra de moneda, encima de las tarjetas. Mostrá la fecha de la referencia y el botón de actualización. Si ya hay un dato guardado, la conversión sigue visible mientras llega la nueva respuesta.

## Ejemplo de props para estudiar

En CatalogPage.jsx:

    <ProductCard
      product={product}
      favorite={shop.favoriteSet.has(product.id)}
      onFavorite={shop.toggleFavorite}
      onDetail={onDetail}
      onAdd={shop.addToCart}
    />

product contiene la información. favorite indica si el corazón está marcado. onFavorite y onAdd son funciones: la tarjeta las llama, pero no cambia por su cuenta el carrito.

## Preguntas frecuentes

**¿Qué cambió respecto del Taller 1?**

Antes main.js armaba el HTML y lo insertaba con innerHTML. Ahora React renderiza componentes a partir de datos y estados.

**¿Qué es un componente?**

Una función que devuelve una parte de la interfaz y puede reutilizarse con diferentes datos.

**¿Qué son props?**

Datos y funciones recibidos del padre. ProductCard recibe el producto y callbacks para sus botones.

**¿Qué es children?**

El contenido colocado entre las etiquetas de un componente. Button recibe así el texto; Card y Dialog reciben su contenido.

**¿Quién modifica el carrito?**

useShop, el controlador. La tarjeta llama a onAdd con el id; el controlador actualiza el estado.

**¿Para qué se usa useState?**

Para guardar información que cambia: filtros, valores de un formulario, menú abierto y datos de la tienda.

**¿Para qué sirve useEffect?**

Para sincronizar la aplicación con elementos externos: almacenamiento, API, eventos del navegador, temporizador de avisos y diálogo nativo.

**¿Por qué hay 2.400 productos pero no 2.400 tarjetas a la vez?**

CatalogPage filtra el arreglo y usa slice para mostrar 24 por página.

**¿Qué significa responsive?**

Que la distribución se adapta al espacio. Las tarjetas usan tres, dos o una columna; el menú se compacta y los filtros se pueden desplegar en celular.

**¿Qué aporta Bootstrap?**

Su CSS para controles y utilidades. El diseño oscuro con cian está en styles.css; catalog.css organiza el catálogo y las tarjetas. Las interacciones se controlan con React.

**¿Qué se guarda al recargar?**

Las publicaciones, favoritos, carrito, pedidos, perfil y consultas de demostración. Los filtros son temporales. La contraseña de ejemplo no se guarda.

**¿Las compras y el acceso son reales?**

Son demostraciones sin backend. El pedido recibe un código para probar el rastreo local, sin realizar un cobro.

**¿Qué aporta la API?**

Una referencia CLP por USD para comparar precios de tecnología. Se muestra la fecha y la fuente. Si falla, la tienda sigue mostrando sus precios CLP.

**¿Usaron IA?**

Sí. ChatGPT ayudó a adaptar y documentar el proyecto. Explicá tu revisión, tus modificaciones y tu aprendizaje reales, y completá el README.
