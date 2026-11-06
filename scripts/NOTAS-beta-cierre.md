# Notas: cambios en la beta del cierre (2026-11-06)

Todo está **solo en `app-beta.html`** (publicado en GitHub, último commit `0e0b573`). `app.html` NO tiene estos cambios.
Beta: https://olvezz.github.io/fac-kayra-dev/app-beta.html (usar `?v=N` nuevo para saltar la caché; GitHub Pages tarda ~3 min en publicar).

## Qué se hizo
1. **Sección "Dinero por eventos del mes"** en el cierre (pantalla, PDF y cierre guardado), antes de "Dinero por cuenta".
   - Trae TODOS los abonos y gastos de las cotizaciones de los eventos del mes, sin importar la fecha en que entraron.
   - Es solo informativa: no afecta Ingresos, Gastos, Resultado neto ni Dinero por cuenta.
   - Tarjetas por cuenta (Cobrado, Gastos, Neto, Por cobrar) + nota "Lo cobrado entró así: antes del mes / en el mes / después del mes".
   - Datos en `datosCierre`: `cuentasEv`, `totalEv`, `sinEv`, `entradoEv`. Se guardan en el cierre como `por_cuenta_eventos` y `total_por_cuenta_eventos`.
2. **Tarjeta "⚠ Sin asignar"** junto a las cuentas (en "Dinero por eventos" y "Dinero por cuenta", y fila en el PDF). Función `sinAsignarTot`. No entra en el TOTAL.
3. **Aviso de cuentas** ahora también cuenta los ingresos de cotizaciones anteriores a la función de cuentas (`n_viejos` / `monto_viejos` en `resumenCuentas`). Antes se omitían sin avisar (ej. RD$4,000 de diferencia en octubre).

## Por qué no cuadraban Ingresos cobrados y Dinero por cuenta (octubre 2026)
- Ingresos 205,450 vs cuentas 201,450: los 4,000 son ingresos de cotizaciones sin cuentas.
- Gastos 140,005 vs cuentas 68,219: los 71,786 son los 36 gastos sin cuenta.
- "Debería haber" (171,981) incluye saldo inicial de meses anteriores (38,750); no es comparable con el resultado neto.

## Pendiente / para seguir
- Que el usuario revise la sección con datos reales: Configuración → "Copiar datos reales a la beta" (lo pulsa él; usa `confirm()` y su sesión).
- Decidir si se pasa a `app.html` (producción) y publicar en Firebase.
- Asignar cuenta a los gastos/ingresos sin cuenta (36 gastos, RD$71,786 en octubre) para que cuadre.
- Idea descartada por ahora: mostrar solo lo cobrado dentro del mes (ya lo cubre "Ingresos del mes").
