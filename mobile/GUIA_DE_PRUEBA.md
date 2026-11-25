# Guía de prueba y demostración

## Preparación (una vez)

1. Abrir el Codespace existente sobre la rama de pruebas `fix/hito4-cuentas-demo-fijas-20261124`, sin crear otro innecesariamente. Si `node` o `docker` muestran `command not found`, abrir la paleta (`Ctrl+Shift+P`) y ejecutar **Codespaces: Rebuild Container**. Si falla, consultar **Codespaces: View Creation Logs**: podría estar en modo de recuperación. El proyecto incluye `.devcontainer/devcontainer.json` con Node 22 y Docker-in-Docker. Al arrancar correctamente, `.devcontainer/start-api.sh` levanta la API y comprueba `/api/v1/health/ready`. Si el contenedor arranca pero la API falla, ejecutar `bash .devcontainer/start-api.sh` y revisar su error. No instalar Java para reparar el backend.
2. Comprobar dentro de Codespaces con `curl --fail http://localhost:3001/api/v1/health/ready` que PostgreSQL y MongoDB estén disponibles. Después, en la pestaña **Puertos**, poner temporalmente el puerto **3001** en visibilidad **Public** y copiar su URL HTTPS; volver a **Private** tras las pruebas. La dirección para la APK debe ser la URL base, sin `/api/v1`.
3. El script de preparación crea o reutiliza exactamente **dos cuentas de demostración con correos estables**: `comprador@nexustech.test` y `vendedor@nexustech.test`. Sus contraseñas se conservan en `.demo-local.json` (aleatorias por defecto o fijas mediante variables privadas), dentro del Codespace, y no se suben a GitHub. Para consultar **solo los correos**, ejecutar `node -e "const d=require('./.demo-local.json'); console.log(d.buyer.email, d.seller.email)"`. Consultar las claves localmente con `cat .demo-local.json`; no compartirlas en capturas, commits o chats públicos. Si existía un archivo anterior, sus datos se respaldan en `.demo-local.previous.json` (ignorado por Git).
4. Instalar el APK en el celular (artefacto `nexustech-apk` en Actions).
5. En la app, en **Servidor**, pegar la URL y tocar **Probar conexión**. Debe decir «Conexión correcta con la API».

### Configurar contraseñas fijas para el testing

1. En el Codespace, crear un archivo privado `.env.demo.local` en la raíz del repositorio, con dos líneas (las claves deben tener de 12 a 128 caracteres):

   ```dotenv
   DEMO_BUYER_PASSWORD=<clave-privada-comprador>
   DEMO_SELLER_PASSWORD=<clave-privada-vendedor>
   ```

2. Ejecutar desde la raíz del repositorio, con la API funcionando en el puerto 3001:

   ```bash
   set -a
   source .env.demo.local
   set +a
   node scripts/hito3-demo.cjs
   ```

3. Usar `comprador@nexustech.test` y `vendedor@nexustech.test` con sus respectivas claves privadas. El script conserva las claves en `.demo-local.json`, excluido del repositorio. Evitar capturas o logs donde aparezcan contraseñas.

**Importante:** las cuentas se crean mediante la API REST y los correos deben estar libres. Si esas cuentas ya existen con otras claves, el script informa un conflicto y no modifica contraseñas ajenas ni borra datos. Para cambiar las claves de una cuenta existente se necesita una operación autorizada en el backend. El script de preparación no limita el registro de otros usuarios.

**Nota:** las cuentas son de demostración y utilizan la misma lógica de usuarios que el resto de NexusTech. Esto no impide registrar otros usuarios en el backend. Para iniciar la demo con estas credenciales es necesario actualizar el Codespace a la rama que contiene el cambio y ejecutar `node scripts/hito3-demo.cjs` con la API del puerto 3001 disponible. El script no elimina usuarios existentes.


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
