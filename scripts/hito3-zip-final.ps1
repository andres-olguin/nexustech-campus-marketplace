# NexusTech Hito 3: ZIP desde un commit remoto. Ejecutar en la raiz del repositorio.
param([string]$Referencia = "origin/entrega/hito3-cierre-20261116")
$ErrorActionPreference = "Stop"
if (-not (Test-Path ".git")) { throw "Debes abrir una terminal en la carpeta raiz de NexusTech." }
git fetch origin --prune
if ($LASTEXITCODE -ne 0) { throw "Fallo git fetch" }
$sha = (git rev-parse "$Referencia").Trim()
if ($LASTEXITCODE -ne 0 -or $sha -notmatch '^[0-9a-f]{40}$') { throw "Referencia invalida: $Referencia" }
$out = Join-Path $env:USERPROFILE ("Downloads\NexusTech_Hito3_16NOV_" + $sha.Substring(0,9) + ".zip")
if (Test-Path $out) { throw "Ya existe $out, no se sobrescribira." }
git archive --format=zip "--output=$out" $sha
if ($LASTEXITCODE -ne 0) { throw "Fallo git archive" }
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [IO.Compression.ZipFile]::OpenRead($out)
try {
  $names = @($zip.Entries | ForEach-Object { $_.FullName })
  foreach ($essential in @("README.md","compose.yaml","backend/src/app.module.ts","nexustech-react/src/App.jsx","backend/src/activity/activity.service.ts")) {
    if ($names -notcontains $essential) { throw "Falta $essential" }
  }
  $bad = @($names | Where-Object { $_ -match '(^|/)(node_modules|\.git)/' -or $_ -match '(^|/)\.env$' -or $_ -match '(^|/)\.demo-local\.json$' })
  if ($bad.Count) { throw "Archivos privados detectados: $($bad -join ', ')" }
} finally { $zip.Dispose() }
$hash = (Get-FileHash $out -Algorithm SHA256).Hash
Write-Host "ZIP: $out" -ForegroundColor Green
Write-Host "COMMIT: $sha"
Write-Host "SHA256: $hash"
Write-Host "Sube el ZIP a Canvas antes del cierre de la entrega."
