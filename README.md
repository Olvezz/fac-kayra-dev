# Kayra Full Party — cotizaciones y finanzas

App web / PWA (HTML + Firebase) para cotizaciones, gastos, cuentas y cierres mensuales.

| Archivo | Qué es |
|---|---|
| `index.html` | Landing y login con Google |
| `app.html` | App real (Firestore de producción) |
| `app-beta.html` | Copia de pruebas (colecciones `beta_`, datos de prueba) |
| `main.css`, `sw.js`, `manifest*.webmanifest` | Estilos, service worker (red primero) y PWA |

## Cómo funciona el dinero

**Base de caja (desde noviembre 2026).** El dinero cuenta cuando se mueve, no cuando es el evento:

- Un **ingreso** cuenta en el mes de la fecha del **abono**.
- Un **gasto** cuenta en el mes de la fecha del **gasto**.
- Excepción: una cotización *Pagada/Realizado* con saldo sin abono registrado no tiene fecha de cobro, y ese saldo cuenta en el mes del **evento**.
- La fecha del evento solo enlaza y agrupa (cotizaciones del mes, conteos, eventos del mes).

Estados: `Cotización → Reservado → Pagada → Realizado` (o `Anulada`). *Pagada* y *Realizado* cuentan el total como cobrado; en *Reservado* solo cuentan los abonos. Los abonos de una anulada se conservan; una devolución se registra como gasto.

Total de una cotización: `Σ cant × precio × (1 − desc%)` + ITBIS (Configuración) + transporte.

### Piezas en `app.html`

- `movimientosCaja(cots, gastos)`: lista única de ingresos y gastos con su mes de caja. Todo lo demás se deriva de aquí.
- `resumenCuentas(cots, gastos, mesAnio)`: por cuenta (Efectivo, BHD, Banreservas, Caribe) saldo inicial, recibido, gastado, saldo final y por cobrar. Saldo = inicial + recibido − gastado.
- `totalesCaja(...)`: Cobrado, Gastos y Beneficio neto del dashboard.
- `datosCierre(mesAnio)`: datos del cierre; los usan el cierre guardado, la vista en pantalla (`verCierre`, el ojo) y el PDF (`descargarPDFCierre`, con opción de compartir en el celular).
- **Pagos recibidos**: cada ingreso enlazado a su evento (cotización, cliente, temática, fecha del evento).

El saldo inicial suma solo lo registrado con cuenta. Los cierres guardados antes del cambio usan el criterio viejo (mes del evento) hasta recalcularlos; los nuevos llevan `metodo: 'caja'`.

## Despliegue

El hosting sirve la carpeta raíz (`public: "."`). `git push` no despliega.

```
firebase deploy --only hosting --account oliverjunior071914@gmail.com
```

En PowerShell, si bloquea `firebase.ps1`, usar `firebase.cmd`. Reglas de Firestore y correos autorizados (`config/accesos`) se gestionan en la consola de Firebase, no en este repo.

## Historial de cambios relevantes

- **2026-11-04 · Base de caja y cierre profesional.** Dashboard, Pagos recibidos y cierres usan fecha de caja. Tarjetas por cuenta con saldo acumulado. Cierre con ingresos fechados y enlazados a su evento, gastos por categoría, saldo por cuenta y eventos con utilidad. Vista en pantalla (ojo), PDF y botón Compartir para PWA.
