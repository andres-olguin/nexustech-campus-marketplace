# Publicar el Hito 3 en GitHub

Para probar el código sin Git, basta con el ZIP y [la guía de Windows](../../DOCKER.md). Para abrir el Pull Request conservando los commits y las integraciones, usá el archivo **NexusTech_Hito3_Integrado.bundle**. Guardalo en Descargas y ejecutá en PowerShell:

```powershell
$bundle = "$env:USERPROFILE\Downloads\NexusTech_Hito3_Integrado.bundle"
$destino = "$env:USERPROFILE\NexusTech-Hito3-PR"
git clone -b entrega/hito3-integrado $bundle $destino
Set-Location $destino
git remote set-url origin https://github.com/andres-olguin/nexustech-campus-marketplace.git
git status --short --branch
git push -u origin entrega/hito3-integrado
```

Si el destino ya existe, elegí un nombre de carpeta nuevo. Si no tenés permisos de escritura, creá un fork, poné su URL en `origin` y abrí el PR desde el fork. GitHub puede pedirte iniciar sesión con la cuenta que tiene acceso.

1. En el repositorio de Andrés, elegí **Pull requests → New pull request**. La rama base es `main`; la rama a comparar es `entrega/hito3-integrado`.
2. Título sugerido: **Integra NexusTech Hito 3 con PostgreSQL y MongoDB**. Describí el catálogo conectado, el precio en PostgreSQL, las consultas en MongoDB y los resultados de las pruebas. Adjuntá evidencia de Compose si lo ejecutaste.
3. Esperá el resultado de **Hito 3 - Compose real** y pedí revisión al equipo. Si `main` avanzó y GitHub pide resolver conflictos, compará las ramas antes de aprobar la integración.
4. Una vez integrado el PR, el ZIP que descargues de `main` debe contener `compose.yaml`, `backend/` y `nexustech-react/`.

El ZIP y el bundle descargados identifican la versión revisada. No subas `.env`, `.demo-local.json`, dependencias instaladas ni resultados de pruebas con datos locales.
