# NexusTech Mobile

App móvil de NexusTech Campus Marketplace (React Native con Expo). Es un segundo cliente de la misma API REST del Hito 3: no tiene backend ni base de datos propios y lo que se hace en el celular se guarda en PostgreSQL y MongoDB por medio de la API, así que también se ve en la web.

## Qué se puede hacer

- Iniciar sesión o crear una cuenta.
- Ver el catálogo con búsqueda, categorías, orden y carga de más resultados.
- Ver el detalle de un producto.
- Marcar y quitar favoritos.
- Agregar productos al carrito, cambiar cantidades y comprar (la compra es simulada).
- Ver los pedidos propios con su estado y cancelar los que todavía se pueden cancelar.

Funcionalidades adicionales:

- **Modo vendedor:** la pestaña *Ventas* muestra las compras de los productos propios y permite avanzar su estado (preparación, despacho, entrega).
- **Preguntas al vendedor:** en el detalle de un producto, el comprador escribe y el vendedor responde. Los mensajes se guardan en MongoDB.

En todas las pantallas hay estado de carga, error con botón de reintento y mensaje cuando no hay resultados. Los formularios validan antes de enviar y muestran el mensaje que devuelve el backend.

La guía para probar y mostrar todo está en [GUIA_DE_PRUEBA.md](GUIA_DE_PRUEBA.md).

## Cómo ejecutarla

Requisitos: Node.js 22 y la app Expo Go en el celular (o un emulador de Android).

```bash
cd mobile
npm install
npx expo start
```

Se escanea el QR con Expo Go. En un emulador de Android, la API en el PC se ve como `http://10.0.2.2:3001`.

## Dirección de la API

La app necesita la dirección base de la API, sin `/api/v1`. Hay tres formas de definirla:

1. En la pantalla de inicio de sesión, sección **Servidor**, con el botón *Probar conexión*. Queda guardada en el teléfono.
2. En la pestaña **Perfil**, sección **Servidor**.
3. Al compilar, con la variable `EXPO_PUBLIC_API_URL`. Si no se define, usa `http://10.0.2.2:3001`.

Para levantar la API con sus bases de datos, desde la raíz del repositorio:

```bash
node scripts/hito3-env.cjs
docker compose -p nexustech up -d --build --wait api
node scripts/hito3-demo.cjs
```

Si no hay Docker, el repositorio incluye `.devcontainer`: se abre en un **GitHub Codespace** y la API queda corriendo sola en el puerto 3001. Hay que ponerlo en visibilidad **Public** en la pestaña *Puertos* para que el celular pueda llegar, y usar esa URL en la app. Las cuentas de prueba quedan en `.demo-local.json`.

## APK

El workflow **Mobile APK** (`.github/workflows/mobile-apk.yml`) compila el APK en cada cambio de `mobile/`. Se descarga desde la pestaña *Actions* de GitHub, en el artefacto `nexustech-apk`. No usa cuentas ni claves externas.

## Endpoints que usa

Todos bajo `/api/v1`. El servicio está en `src/services/api.js`.

| Pantalla | Método y ruta |
|---|---|
| Inicio de sesión | `POST /auth/login`, `POST /auth/register` |
| Perfil | `GET /users/me`, `GET /health/ready` |
| Catálogo | `GET /products`, `GET /categories` |
| Detalle | `GET /products/:id` |
| Favoritos | `GET /favorites`, `PUT /favorites/:productId`, `DELETE /favorites/:productId` |
| Carrito | `GET /cart`, `PUT /cart`, `DELETE /cart/:productId` |
| Compra | `POST /orders` |
| Pedidos | `GET /orders`, `GET /orders/:id`, `PATCH /orders/:id/status` |
| Ventas (vendedor) | `GET /seller/orders`, `PATCH /seller/orders/:id/status` |
| Preguntas al vendedor | `GET /activity/interactions/target/:id`, `POST /activity/interactions` |

## Estructura

```
mobile/
  App.js                    navegación (pestañas y pantallas)
  src/config.js             dirección por defecto de la API y colores
  src/services/api.js       cliente HTTP único (token, errores, tiempo de espera)
  src/context/AuthContext.js  sesión, dirección de la API y favoritos
  src/components/UI.js      botones, campos y estados reutilizables
  src/screens/              una pantalla por flujo
```

## Uso de IA

Esta app se generó con ayuda de Claude (Anthropic), a partir del enunciado del Hito 4 y de los endpoints y respuestas reales del backend del Hito 3. Claude escribió el código de `mobile/` y la configuración para compilar el APK y levantar la API en Codespaces.

El equipo debe completar aquí qué revisó, qué probó en el celular y qué cambió o corrigió.
