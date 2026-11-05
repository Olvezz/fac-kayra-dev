# Publica en Firebase Hosting lo que está COMMITEADO (git HEAD), sin archivos sueltos de la carpeta de trabajo.
# Uso (desde la carpeta del proyecto):   powershell -ExecutionPolicy Bypass -File scripts\desplegar.ps1
# Ojo: tus usuarios abren la app por GitHub Pages (olvezz.github.io/fac-kayra-dev); eso se publica con "git push" a main.
#      Este script es para Firebase Hosting (kayra-cotizaciones.web.app).
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$cambios = git -C $repo status --porcelain --untracked-files=no
if ($cambios) { Write-Host "Aviso: hay cambios sin commit; se publicará solo lo ya commiteado:" -ForegroundColor Yellow; $cambios }
$id  = [guid]::NewGuid().ToString('N')
$zip = Join-Path $env:TEMP "kayra_$id.zip"
$dir = Join-Path $env:TEMP "kayra_$id"
try {
  git -C $repo archive --format=zip -o $zip HEAD          # respeta export-ignore de .gitattributes
  Expand-Archive -Path $zip -DestinationPath $dir
  Push-Location $dir
  firebase.cmd deploy --only hosting --account oliverjunior071914@gmail.com
} finally {
  Pop-Location
  Remove-Item -Recurse -Force $dir, $zip -ErrorAction SilentlyContinue
}
