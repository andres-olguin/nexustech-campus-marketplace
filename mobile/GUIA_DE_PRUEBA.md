# Guía de prueba y demostración

## Preparación

La app necesita una API accesible desde el celular. La forma verificada es el workflow **API pública temporal**, que levanta la API real (NestJS + PostgreSQL + MongoDB con Docker Compose) en un servidor de GitHub Actions, carga la demo, prueba los flujos de la app y abre una URL pública. No necesita Docker ni Codespaces en tu computador.

### 1. (Una vez) Claves fijas para las cuentas de demostración

En GitHub: **Settings → Secrets and variables → Actions → New repository secret**. Crear dos secretos con claves propias de 12 a 128 caracteres:

- `DEMO_BUYER_PASSWORD` (comprador)
- `DEMO_SELLER_PASSWORD` (vendedor)

Las cuentas son `comprador@nexustech.test` y `vendedor@nexustech.test`. Las claves nunca se suben al repositorio ni salen en los logs. Si no se crean los secretos, el workflow igual funciona, pero las claves de esas dos cuentas serán aleatorias y desconocidas; en ese caso se puede probar creando una cuenta propia desde la app (pantalla de registro).

### 2. Encender la API

1. GitHub → pestaña **Actions** → workflow **API pública temporal (para probar la app móvil)** → **Run workflow** → rama `feat/hito4-api-tunel` → indicar los minutos (por defecto 120, máximo 300).
2. Esperar unos 5 minutos. Cuando el job llega al paso **Mantener la API disponible**, la dirección está lista:
   - en la página del commit o del PR aparecen los estados `api-url` (la dirección) y `api-flujos / resumen` (resultado de la prueba automática);
   - también está en el log del paso **Abrir URL pública temporal**.
3. La dirección cambia cada vez que se enciende y la base de datos empieza vacía (con la demo cargada). Al terminar los minutos, se apaga sola.

### 3. Conectar la app

1. Instalar el APK en el celular (artefacto `nexustech-apk` en Actions).
2. En la app, en **Servidor**, pegar la dirección (sin `/api/v1`) y tocar **Probar conexión**. Debe decir «Conexión correcta con la API».
3. Iniciar sesión con las cuentas de demostración, o crear una cuenta con una clave de 12 caracteres o más.

### Qué se verificó automáticamente y qué no

El workflow ejecuta `mobile/scripts/flows-smoke.mjs`, que usa el mismo `src/services/api.js` de la app contra la API real: conexión, registro (y rechazo de clave corta), login (y rechazo de clave incorrecta), perfil, catálogo y búsqueda, detalle, favoritos, carrito, compra simulada, pedidos, pregunta al vendedor (MongoDB), ventas, respuesta del vendedor, avance de estado y cancelación. También comprueba que correr `scripts/hito3-demo.cjs` dos veces no duplica datos ni cambia las claves.

Eso **no** reemplaza probar en el celular: las pantallas, los botones y la instalación del APK solo se comprueban con el teléfono. Los pasos del recorrido de abajo hay que ejecutarlos ahí.

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

## Alternativa: Codespaces (sin verificar)

El repositorio incluye `.devcontainer` para levantar la API en un Codespace, pero **no se ha comprobado que funcione**: el Codespace de prueba cayó en modo de recuperación (sin `node` ni `docker`). Para usarlo hay que revisar antes el log de creación (**Codespaces: View Creation Log**, ir al final y buscar `ERROR` o `Non-zero exit code`). Si funciona, la API queda en el puerto 3001 y hay que ponerlo en visibilidad **Public** en la pestaña *Puertos*.

### Diagnóstico rápido del Codespace

```bash
pwd
git branch --show-current
node --version
docker --version
docker compose version
bash .devcontainer/start-api.sh
curl --fail http://localhost:3001/api/v1/health/ready
```

Si faltan `node` y `docker` a la vez, **no** es un error de la APK ni de las cuentas: el Codespace no está usando el Dev Container esperado. Reconstruirlo y, si sigue fallando, revisar los logs de creación antes de configurar BlueStacks.

