# Acciones de mouse/teclado reales para grabar el paso a paso en Brave.
# Anota en pasos-pc.log los segundos desde el inicio de la grabación (t0.txt) y la posición de cada clic.
. "$PSScriptRoot\win.ps1"
Add-Type -AssemblyName System.Windows.Forms
$global:LOG = "$PSScriptRoot\pasos-pc.log"
function Now { $t0 = [double](Get-Content "$PSScriptRoot\t0.txt"); return [Math]::Round(([DateTimeOffset]::Now.ToUnixTimeMilliseconds()/1000.0) - $t0, 2) }
function Log($m) { Add-Content -Path $global:LOG -Value ("{0} {1}" -f (Now), $m) }
function Glide($x, $y, $ms = 900) {
  $p = [System.Windows.Forms.Cursor]::Position; $x0 = $p.X; $y0 = $p.Y
  $n = [Math]::Max(12, [int]($ms / 16)); $arc = [Math]::Min(60, [Math]::Sqrt(($x-$x0)*($x-$x0)+($y-$y0)*($y-$y0)) * .1)
  for ($i = 0; $i -le $n; $i++) { $t = $i / $n; $e = if ($t -lt .5) { 4*$t*$t*$t } else { 1 - [Math]::Pow(-2*$t+2, 3)/2 }
    [W]::SetCursorPos([int]($x0 + ($x-$x0)*$e), [int]($y0 + ($y-$y0)*$e - [Math]::Sin($t*[Math]::PI)*$arc)) | Out-Null; Start-Sleep -Milliseconds 16 }
}
function Clk($x, $y, $ms = 900, $label = '') { Glide $x $y $ms; Start-Sleep -Milliseconds 120; Log "click $x $y $label"; [W]::mouse_event(2,0,0,0,0); Start-Sleep -Milliseconds 80; [W]::mouse_event(4,0,0,0,0) }
function Typ($text, $cps = 14) { foreach ($ch in $text.ToCharArray()) { $k = [string]$ch; if ('+^%~(){}[]'.Contains($k)) { $k = '{' + $k + '}' }; [System.Windows.Forms.SendKeys]::SendWait($k); Start-Sleep -Milliseconds ([int](1000/$cps)) } }
function Key($k) { [System.Windows.Forms.SendKeys]::SendWait($k) }
function Shot($name = 'pcnow') { ffmpeg -hide_banner -loglevel error -f gdigrab -i desktop -frames:v 1 -vf "crop=2560:1440:0:0,scale=1280:-1" "$PSScriptRoot\..\$name.png" -y }
