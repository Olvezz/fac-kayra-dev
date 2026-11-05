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

## Vista del cierre (pensada para celular)

- **Índice fijo** arriba (Resumen · Eventos · Ingresos · Gastos · Cuentas): salta a la sección y resalta la que se está leyendo. Botón "⇕ Expandir/Contraer" abre o cierra todo.
- **Secciones plegables** con su total siempre visible (`secD` en `cierreHtml`). Por defecto solo "Eventos" está abierta.
- **Cada evento es compacto** (cotización, fecha, estado y neto); al tocarlo muestra gastos, totales y abonos con fecha.
- Ingresos y gastos son **listas**, no tablas anchas; las cuentas son **tarjetas**. El detalle de gastos va plegado bajo el gráfico de pastel.
- Barra inferior fija con Cerrar / Compartir / Guardar cierre / Descargar PDF.
- Lo abierto/cerrado se recuerda (`cierreAbierto`): al guardar algo y refrescarse el cierre no se vuelve a plegar.

## Selector de período flotante (dashboard)

Al bajar y salir de pantalla el selector original, aparece una copia en la esquina superior derecha con animación (`flotanteVer`). Sus estilos esenciales van **en línea** y `main.css` se enlaza con `?v=...`: así un `main.css` viejo en caché no lo deja "abajo de la página". Al cambiar `main.css`, subir el número de versión en `app.html` y `app-beta.html`.

## Cierre automático

No hay servidor: la revisión corre en el navegador (`autoCerrarMesAnterior` en `app.html`) cada vez que se abre la app.

- **Día 1 (o el primer día que alguien abra la app desde el 1):** si el mes anterior no tiene cierre y tuvo actividad, se calcula y guarda solo (`automatico: true`; en la lista aparece "⚙ automático"). Un mes sin actividad no genera cierre vacío.
- **Primera semana (días 1–7):** un cierre automático se refresca una vez al día, por si se registraron cosas atrasadas.
- **Nunca se sobrescribe solo** un cierre guardado por una persona (botón "Calcular cierre" o "💾 Guardar cierre" del detalle).
- La ventana de detalle del cierre siempre se calcula en vivo; el cierre *guardado* solo cambia con lo anterior.
- Limitación: depende de que alguien abra la app. Para una ejecución exacta a las 00:00 del día 1 haría falta una Cloud Function programada (requiere plan Blaze).

## Despliegue

El hosting sirve la carpeta raíz (`public: "."`). `git push` no despliega.

```
firebase deploy --only hosting --account oliverjunior071914@gmail.com
```

En PowerShell, si bloquea `firebase.ps1`, usar `firebase.cmd`. Reglas de Firestore y correos autorizados (`config/accesos`) se gestionan en la consola de Firebase, no en este repo.

## Historial de cambios relevantes

- **2026-11-04 · Base de caja y cierre profesional.** Dashboard, Pagos recibidos y cierres usan fecha de caja. Tarjetas por cuenta con saldo acumulado. Cierre con ingresos fechados y enlazados a su evento, gastos por categoría, saldo por cuenta y eventos con utilidad. Vista en pantalla (ojo), PDF y botón Compartir para PWA.

- **2026-11-05 · Actualización grande (en producción).** Cierre rediseñado para celular (índice, secciones plegables, eventos compactos) y cierre automático el día 1; selector de período con calendario nuevo, selector flotante y Ganancia general; en la cotización, servicios y abonos como tarjetas plegables, buscador de servicios (A–Z) y barra de avance del pago; calendario propio de fechas (marca días con eventos, avisa choques de fecha y hora, bloquea fechas pasadas en cotizaciones nuevas); listas desplegables con diseño propio; correcciones de ancho/scroll en celular; las listas por mes ya no dependen de índices compuestos.

## Anuncio de actualización (Registros)

`anunciarActualizacion()` (en `app.html` y `app-beta.html`) guarda UNA entrada en `logs` con id fijo (`ANUNCIO_ID`) la primera vez que alguien abre la app tras publicarla. Para un próximo anuncio: cambiar `ANUNCIO_ID` y `ANUNCIO_TEXTO`.

## Notas de despliegue

- Subir el número de `main.css?v=...` en `app.html` y `app-beta.html` cada vez que cambie el CSS (el celular guarda copias viejas).
- No publicar desde la carpeta de trabajo si tiene archivos sueltos (capturas, etc.): se despliega una carpeta temporal con `git archive HEAD` + los archivos modificados.
- Las consultas con `where` + `orderBy` sobre campos distintos necesitan índice compuesto (la beta no los tiene): ordenar en memoria.

## Cambios reversibles

- **Filas del dashboard abren la cotización** (Próximos eventos y Recientes). Para deshacerlo: en `app.html` poner `DASH_FILAS_ABREN_COTIZACION = false`; las filas vuelven a ser solo informativas. Es lo único que hay que tocar.
