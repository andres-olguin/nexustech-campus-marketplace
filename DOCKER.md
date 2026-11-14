# NexusTech Hito 3 · Paso a paso en Windows

Usá **PowerShell**, Node.js 22.12 o posterior y **Docker Desktop en modo Linux**. Abrí Docker Desktop y esperá a que aparezca el motor en ejecución. Si venís del ZIP anterior, descomprimí esta entrega en una carpeta nueva.

1. Entrá a la carpeta que tiene `compose.yaml`. Comprobá el entorno:

   ```powershell
   Get-Item compose.yaml
   node --version
   docker info
   docker compose version
   ```

2. Generá los valores locales e iniciá los cuatro servicios:

   ```powershell
   node scripts/hito3-env.cjs
   docker compose -p nexustech-hito3-final config --quiet
   docker compose -p nexustech-hito3-final up -d --build --wait --wait-timeout 240
   docker compose -p nexustech-hito3-final ps
   ```

   El backend ejecuta las migraciones antes de iniciar. `web`, `api`, `postgres` y `mongo` deben figurar en ejecución y saludables. React usa el puerto 5173, NestJS el 3001 y PostgreSQL el 5433 del equipo; MongoDB queda dentro de la red de Compose.

3. Cargá datos nuevos para la demostración:

   ```powershell
   Invoke-RestMethod http://localhost:3001/api/v1/health/ready
   node scripts/hito3-demo.cjs
   notepad .demo-local.json
   ```

   Ese archivo local incluye las cuentas de vendedor y comprador (correos de prueba y claves generadas), además de los productos. Conservá el archivo mientras usás esa misma base; el script reconoce una demo ya preparada. No lo subas a GitHub.

4. Abrí [la web](http://localhost:5173) y entrá como vendedor. Buscá **Memoria RAM demo**; debe aparecer el filtro **Capacidad total mínima**. Elegí **16 GB**, abrí la ficha y probá **Editar precio** desde la tarjeta. Usá otro perfil de navegador o una ventana privada para iniciar sesión como comprador y comprobar el nuevo precio.

5. Probá PostgreSQL y MongoDB desde React:

   - En el catálogo del servidor, abrí **Teclado mecánico demo**. Desde **Consultar al vendedor**, enviá una pregunta.
   - Agregá una unidad al carrito, elegí **Continuar con pedido simulado** y escribí un punto de retiro ficticio. Confirmá y abrí **Pedidos y ventas**.
   - En **Actividad → Conversaciones e Interacciones**, comprobá el mensaje. Iniciá sesión como vendedor para verificar que le llegó.
   - Si querés comprobar persistencia, reiniciá el mismo proyecto. Entrá de nuevo y consultá el pedido y la conversación.

   ```powershell
   docker compose -p nexustech-hito3-final restart
   docker compose -p nexustech-hito3-final ps
   ```

6. En [Swagger](http://localhost:3001/docs), ejecutá primero **GET /api/v1/health/ready**. Para el caso de stock, iniciá sesión con el comprador de prueba en **POST /api/v1/auth/login**, usá su `accessToken` en **Authorize**, y ejecutá **PUT /api/v1/cart** con el ID del teclado y `quantity: 100`. La API devuelve **409** si supera el stock. Hacelo con la cuenta ficticia.

7. Para detener el entorno conservando pedidos y mensajes:

   ```powershell
   docker compose -p nexustech-hito3-final down
   ```

Si el paso 2 falla, revisá `docker compose -p nexustech-hito3-final logs --tail 80 api` y `ps`. Si un puerto está ocupado, detené primero la copia anterior que esté usando ese puerto. Si aparece autenticación fallida en una base, verificá que estés usando el mismo `.env` con el mismo proyecto y sus volúmenes. Cambiar la contraseña escrita en `.env` no cambia automáticamente las credenciales del motor inicializado. Los comandos de esta guía conservan los volúmenes.

El HTML `nexustech-react/VISTA_PREVIA.html` y las páginas antiguas de la raíz son muestras de talleres anteriores. Para probar cuentas, comprar y enviar mensajes, usá la web iniciada por Compose.
