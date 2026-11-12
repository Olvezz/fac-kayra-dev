param([int]$x0,[int]$y0,[int]$x1,[int]$y1,[int]$ms=1100,[switch]$click)
. "$PSScriptRoot\win.ps1"
$n=[Math]::Max(10,[int]($ms/16))
for($i=0;$i -le $n;$i++){ $t=$i/$n; $e= if($t -lt .5){4*$t*$t*$t}else{1-[Math]::Pow(-2*$t+2,3)/2}
  [W]::SetCursorPos([int]($x0+($x1-$x0)*$e),[int]($y0+($y1-$y0)*$e - [Math]::Sin($t*[Math]::PI)*40)) | Out-Null; Start-Sleep -Milliseconds 16 }
if($click){ Start-Sleep -Milliseconds 150; [W]::mouse_event(2,0,0,0,0); Start-Sleep -Milliseconds 90; [W]::mouse_event(4,0,0,0,0) }
