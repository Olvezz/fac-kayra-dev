Add-Type @"
using System; using System.Runtime.InteropServices; using System.Text; using System.Collections.Generic;
public class W {
 [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc p, IntPtr l);
 public delegate bool EnumProc(IntPtr h, IntPtr l);
 [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
 [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
 [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr a, int x, int y, int cx, int cy, uint f);
 [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int c);
 [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
 [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
 [DllImport("user32.dll")] public static extern void mouse_event(uint f, int x, int y, uint d, int e);
 public static List<KeyValuePair<IntPtr,string>> All(){ var r=new List<KeyValuePair<IntPtr,string>>(); EnumWindows((h,l)=>{ if(IsWindowVisible(h)){var sb=new StringBuilder(256); GetWindowText(h,sb,256); if(sb.Length>0) r.Add(new KeyValuePair<IntPtr,string>(h,sb.ToString()));} return true;},IntPtr.Zero); return r; }
}
"@
function Find($pat){ [W]::All() | Where-Object { $_.Value -like $pat } }
function Click($x,$y){ [W]::SetCursorPos($x,$y); Start-Sleep -m 150; [W]::mouse_event(2,0,0,0,0); [W]::mouse_event(4,0,0,0,0) }
