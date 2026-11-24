# Guía de prueba y demostración

## Preparación (una vez)

1. Abrir un Codespace sobre la rama `feat/hito4-mobile` y esperar a que termine de levantar (la terminal avisa cuando la API está lista).
2. En la pestaña **Puertos**, poner el puerto **3001** en visibilidad **Public** y copiar su URL.
3. En la terminal del Codespace: `cat .demo-local.json`. Ahí están el **vendedor** y el **comprador** de prueba, con su correo y contraseña. Pasarlos al celular por WhatsApp.
4. Instalar el APK en el celular (artefacto `nexustech-apk` en Actions).
5. En la app, en **Servidor**, pegar la URL y tocar **Probar conexión**. Debe decir «Conexión correcta con la API».

## Recorrido de la demostración

**1. Comprador: explorar y comprar**
- Iniciar sesión con la cuenta del comprador.
- En **Catálogo**: buscar «RAM», cambiar de categoría y de orden.
- Abrir un producto, marcar el corazón (favorito) y verlo en **Favoritos**.
- Agregar «Teclado mecánico demo» al carrito, ir a **Carrito** y confirmar la compra con una dirección.
- Ver el pedido en **Pedidos**: estado *Confirmado*.

**2. Funcionalidad adicional: preguntas al vendedor (MongoDB)**
- Como comprador, abrir «Teclado mecánico demo» y escribir una pregunta en **Preguntas al vendedor**.
- Cerrar sesión (Perfil) y entrar como vendedor. Abrir el mismo producto: aparece la pregunta y se puede responder.

**3. Funcionalidad adicional: modo vendedor**
- Como vendedor, abrir la pestaña **Ventas**: aparece la compra del paso 1.
- Tocar **Marcar en preparación** y confirmar.

**4. Comprobar que se refleja**
- Cerrar sesión y entrar como comprador. En **Pedidos** el estado pasó a *En preparación*.
- También se puede verificar en Swagger (`<URL>/docs`) con `GET /orders`, o en la web.

**5. Errores y validaciones para mostrar**
- Registro con contraseña de menos de 12 caracteres.
- Compra con una dirección corta.
- Pregunta de un solo carácter.
- Dirección de API incorrecta en **Servidor**: la app avisa que no puede conectarse.

## Dónde está el código

| Funcionalidad | Archivo |
|---|---|
| Cliente HTTP único | `src/services/api.js` |
| Modo vendedor (ventas) | `src/screens/SalesScreen.js` |
| Preguntas al vendedor | `src/components/ProductQuestions.js` |
| Compra | `src/screens/CartScreen.js` |
