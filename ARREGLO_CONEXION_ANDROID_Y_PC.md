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

**Importante:** publicar los puertos en todas las interfaces es apropiado para desarrollo/pruebas en una red de confianza. No expongas esta configuración de demostración directamente a Internet.
