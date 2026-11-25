# Arreglo de conexión de NexusTech

## Qué estaba fallando

La dirección `http://10.0.2.2:3001` de la captura no incluye el prefijo REST `/api/v1`.
Además, Docker publicaba los puertos únicamente en `127.0.0.1`, por lo que el emulador
Android no podía alcanzar el backend a través de `10.0.2.2`. CORS tampoco autorizaba
el origen del frontend abierto desde el emulador.

## Cambios aplicados

- API publicada en el puerto 3001 para conexiones locales y desde el emulador.
- Frontend publicado en el puerto 5173 para conexiones locales y desde el emulador.
- CORS autoriza `http://10.0.2.2:5173`, además de localhost.
- La ruta base correcta de la API incluye `/api/v1`.

## Cómo iniciarlo (Windows / PowerShell)

Desde la carpeta raíz del proyecto, donde está `compose.yaml`:

```powershell
node scripts/hito3-env.cjs
docker compose -p nexustech-hito3-final up -d --build --wait --wait-timeout 240
docker compose -p nexustech-hito3-final ps
```

En el navegador del PC:
- Web: `http://localhost:5173`
- API: `http://localhost:3001/api/v1`
- Salud de API: `http://localhost:3001/api/v1/health/ready`

En el emulador Android:
- Web: `http://10.0.2.2:5173`
- En el campo **Dirección de la API**, usar exactamente:
  `http://10.0.2.2:3001/api/v1`

Luego presiona **Probar conexión**. No uses solamente `http://10.0.2.2:3001`.

## Si todavía falla

1. Confirma que `api`, `web`, `postgres` y `mongo` estén `healthy` o en ejecución:
   `docker compose -p nexustech-hito3-final ps`
2. Prueba la salud desde el PC:
   `Invoke-RestMethod http://localhost:3001/api/v1/health/ready`
3. Mira el log del backend:
   `docker compose -p nexustech-hito3-final logs --tail 100 api`
4. Si cambiaste `compose.yaml`, vuelve a ejecutar `up -d --build`.

## Generar la APK

La APK se arma con Capacitor desde `nexustech-react`. El proyecto de Android ya está en `nexustech-react/android`.

### Por qué no conectaba la APK

- Dentro de la APK la web no se abre desde `http://10.0.2.2:5173`, sino desde `http://localhost`
  (Capacitor). Ese origen no estaba permitido en CORS, así que el backend rechazaba todas las peticiones.
- La dirección de la API se mete en la app al compilar (`VITE_API_BASE_URL`). Si no se define,
  queda `http://localhost:3000/api/v1`, y en el teléfono `localhost` es el propio teléfono.
- Android bloquea por defecto las conexiones `http://` sin cifrar dentro de una app.

### Qué se cambió

- CORS (en `compose.yaml` y en `backend/src/bootstrap.ts`) ahora acepta también `http://localhost`,
  `https://localhost` y `capacitor://localhost`.
- `nexustech-react/.env.android` define la API para la APK: `http://10.0.2.2:3001/api/v1`.
- `capacitor.config.json` usa el esquema `http` y permite tráfico sin cifrar, y el
  `AndroidManifest.xml` tiene `usesCleartextTraffic="true"`.

### Pasos

Requisitos: Node 22, Android Studio con un emulador creado, y el backend corriendo con Docker
(sección de arriba). Si Docker ya estaba levantado, hay que volver a ejecutar `up -d --build` para que tome el CORS nuevo.

```powershell
cd nexustech-react
npm install
npm run android:build
npm run android:open
```

En Android Studio: esperar que termine el "Gradle sync", elegir el emulador y darle a Run (▶).
Para sacar el archivo: **Build → Build App Bundle(s) / APK(s) → Build APK(s)**. Queda en
`android/app/build/outputs/apk/debug/app-debug.apk`.

**Celular físico:** en `.env.android` cambia `10.0.2.2` por la IP del PC en la red Wi-Fi
(`ipconfig` en Windows), vuelve a correr `npm run android:build`, y revisa que el firewall
de Windows deje pasar el puerto 3001. El celular y el PC tienen que estar en la misma red.

Cada vez que cambies algo del frontend, hay que correr `npm run android:build` antes de volver a compilar en Android Studio.

**Importante:** publicar los puertos en todas las interfaces es apropiado para desarrollo/pruebas en una red de confianza. No expongas esta configuración de demostración directamente a Internet.
