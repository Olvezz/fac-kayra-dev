# Kayra Full Party — cotizaciones y finanzas

App web / PWA (HTML + Firebase) para cotizaciones, gastos, cuentas y cierres mensuales.

| Archivo | Qué es |
|---|---|
| `index.html` | Landing y login con Google |
| `app.html` | App real (Firestore de producción) |
| `app-beta.html` | Copia de pruebas (colecciones `beta_`, datos de prueba) |
| `main.css`, `sw.js`, `manifest*.webmanifest` | Estilos, service worker (red primero) y PWA (con atajos del ícono) |

## Cómo funciona el dinero

**Base de caja (desde noviembre 2026).** El dinero cuenta cuando se mueve, no cuando es el evento:

- Un **ingreso** cuenta en el mes de la fecha del **abono**.
- Un **gasto** cuenta en el mes de la fecha del **gasto**.
- Excepción: una cotización *Pagada/Realizado* con saldo sin abono registrado no tiene fecha de cobro, y ese saldo cuenta en el mes del **evento**.
- La fecha del evento solo enlaza y agrupa (cotizaciones del mes, conteos, eventos del mes).

Estados: `Cotización → Reservado → Pagada → Realizado` (o `Anulada`). *Pagada* y *Realizado* cuentan el total como cobrado; en *Reservado* solo cuentan los abonos. Los abonos de una anulada se conservan en las cuentas (al anularla sale un aviso); una devolución se registra como gasto. Una cotización con abonos nunca se borra sola, y al eliminarla a mano se avisa que ese dinero dejaría de contar. El estado avanza solo con los abonos: el primero pasa *Cotización* a *Reservado* y cubrir el total la marca *Pagada* (nunca retrocede ni toca *Realizado*/*Anulada*).

Total de una cotización: `Σ cant × precio × (1 − desc%)` + ITBIS (Configuración) + transporte.

### Piezas en `app.html`

- `movimientosCaja(cots, gastos)`: lista única de ingresos y gastos con su mes de caja. Todo lo demás se deriva de aquí.
- `resumenCuentas(cots, gastos, mesAnio)`: por cuenta saldo inicial, recibido, gastado, saldo final y por cobrar. Saldo = inicial + recibido − gastado. Lo que no tiene cuenta (o tiene una que ya no existe) va a **Sin asignar**.
- `totalesCaja(...)`: Cobrado, Gastos y Beneficio neto del dashboard.
- `datosCierre(mesAnio)`: datos del cierre; los usan el cierre guardado, la vista en pantalla (`verCierre`, el ojo) y el PDF (`descargarPDFCierre`, con opción de compartir en el celular).
- **Pagos recibidos**: cada ingreso enlazado a su evento (cotización, cliente, temática, fecha del evento).

El saldo inicial suma solo lo registrado con cuenta. Los cierres guardados antes del cambio usan el criterio viejo (mes del evento) hasta recalcularlos; los nuevos llevan `metodo: 'caja'`.

## Cuentas y categorías de gastos (Configuración)

Ya no están fijas en el código: se guardan en `config/listas` (`{ cuentas: [{nombre, color, activa}], categorias: [{nombre, activa}] }`). Si el documento no existe se usan las de siempre (Efectivo, BHD, Banreservas, Caribe y las 9 categorías). Al cargar, `aplicarListas()` las vuelca en `CUENTAS`, `CUENTA_COLOR` y `CATS_GASTO`, así saldos, cierres y filtros las usan sin más cambios.

- **Editar**: nombre y color (cuentas) o nombre (categorías). Renombrar actualiza los registros que la usan (`migrarCuenta` / `migrarCategoria`): gastos, abonos y cuenta de cobro de las cotizaciones, y los totales por cuenta de los cierres guardados.
- **Deshabilitar**: deja de salir en los selectores para anotar (`cuentasActivas()`, `catsActivas()`), pero su historial y sus saldos se siguen viendo. Si un registro viejo la usa, al editarlo sigue apareciendo.
- **Borrar**: sin movimientos se borra directo; con movimientos pide a qué otra pasarlos (así nada queda en *Sin asignar*). Siempre queda al menos una habilitada.

## Registro rápido (botón +)

Pensado para el celular: anotar en pocos toques. Código en el bloque `REGISTRO RÁPIDO` (`qrAbrir`, `qrGuardar`, …).

- **Botón "+"** abajo a la derecha en todas las pantallas: **Gasto**, **Abono de un evento** o **Nueva cotización**.
- **Gasto**: monto (grande y centrado), categoría y cuenta como listas desplegables (recuerda la última usada), fecha con el calendario propio de Kayra (no deja fechas futuras), descripción opcional con sugerencias de las más usadas en esa categoría y evento opcional. Se guarda con el mismo formato que "Nuevo gasto" y `origen: 'rapido'`.
- **Abono**: lista de eventos con saldo pendiente (los más cercanos primero, con buscador); muestra total, abonado y lo que debe, con atajos "Todo lo que debe" y "La mitad". Actualiza `abonos`, `abono` y el estado de la cotización.
- **Deshacer** durante 12 s después de guardar.
- **Sin señal**: Firestore usa caché persistente en el teléfono (`initializeFirestore` + `persistentLocalCache`); lo anotado se guarda ahí y se envía solo al volver la conexión, aunque se cierre la app. Si el servidor no confirma en 2.5 s, el aviso dice "Guardado en el teléfono".
- **Atajos del ícono** (Android, app instalada): mantener presionado el ícono → "Anotar gasto" / "Anotar abono" (`app.html?rapido=gasto|abono`, declarados en el manifest). Se pueden arrastrar a la pantalla de inicio. Si la app ya estaba instalada, puede hacer falta reinstalarla para que aparezcan.
- **Sacudir para anotar** (opcional, por teléfono, en Configuración, con 3 sensibilidades): mismo criterio que el detector de la app Chele. Solo funciona con la app abierta en pantalla (una web no puede escuchar el sensor en segundo plano).
- En el celular la hoja no abre el teclado sola: aparece al tocar el monto. Con el teclado abierto, la hoja se sube encima de él para que "Guardar" siempre se vea (`qrAjustarTeclado`).

## Cotizaciones

- **Crear un servicio sin salir de la cotización**: en "Agregar servicios", si lo buscado no existe aparecen "Crear «…» en el catálogo" (abre el formulario del catálogo encima; "Guardar y agregar" lo guarda y lo añade a la cotización; "‹ Volver" regresa a la lista) y "Agregar «…» solo a esta cotización" (servicio libre). La cotización abierta no se toca.
- Cliente nuevo desde la cotización: botón "+ Nuevo cliente" (mismo principio).

## Calendario

Apartado propio en el menú (y botón "Calendario" en la agenda del dashboard). Vista **Mes** (cada día muestra hora y cliente; en el celular solo el primer nombre) y vista **Lista** agrupada por día con el nombre del día ("Sábado 21 de noviembre"). Al tocar un día se ve su detalle; "+ Evento este día" abre una cotización con esa fecha. Usa el mapa de eventos en vivo (`eventosMapa`, sin anuladas) y filtros por estado guardados en el navegador.

## Vista del cierre (pensada para celular)

- **Índice fijo** arriba (Resumen · Eventos · Ingresos · Gastos · Cuentas): salta a la sección y resalta la que se está leyendo. Botón "Expandir/Contraer" abre o cierra todo.
- **Secciones plegables** con su total siempre visible (`secD` en `cierreHtml`). Por defecto solo "Eventos" está abierta.
- **Cada evento es compacto** (cotización, fecha, estado y neto); al tocarlo muestra gastos, totales y abonos con fecha.
- Ingresos y gastos son **listas**, no tablas anchas; las cuentas son **tarjetas**, más una tarjeta **Sin asignar** cuando hay ingresos o gastos sin cuenta. El detalle de gastos va plegado bajo el gráfico de pastel.
- Barra inferior fija con Cerrar / Compartir / Guardar cierre / Descargar PDF.
- Lo abierto/cerrado se recuerda (`cierreAbierto`): al guardar algo y refrescarse el cierre no se vuelve a plegar.
- **Solo en la beta:** sección "Dinero por eventos del mes" (todo lo cobrado y gastado por los eventos del mes, sin importar cuándo entró; solo informativa). En la original no está.

## Selector de período flotante (dashboard)

Al bajar y salir de pantalla el selector original, aparece una copia en la esquina superior derecha con animación (`flotanteVer`). Sus estilos esenciales van **en línea** y `main.css` se enlaza con `?v=...`: así un `main.css` viejo en caché no lo deja "abajo de la página". Al cambiar `main.css`, subir el número de versión en `app.html` y `app-beta.html`.

## Cierre automático

No hay servidor: la revisión corre en el navegador (`autoCerrarMesAnterior` en `app.html`) cada vez que se abre la app.

- **Día 1 (o el primer día que alguien abra la app desde el 1):** si el mes anterior no tiene cierre y tuvo actividad, se calcula y guarda solo (`automatico: true`; en la lista aparece "automático"). Un mes sin actividad no genera cierre vacío.
- **Primera semana (días 1–7):** un cierre automático se refresca una vez al día, por si se registraron cosas atrasadas.
- **Nunca se sobrescribe solo** un cierre guardado por una persona (botón "Calcular cierre" o "Guardar cierre" del detalle).
- La ventana de detalle del cierre siempre se calcula en vivo; el cierre *guardado* solo cambia con lo anterior.
- Limitación: depende de que alguien abra la app. Para una ejecución exacta a las 00:00 del día 1 haría falta una Cloud Function programada (requiere plan Blaze).

## Diseño: íconos, no emojis

La app no usa emojis: los íconos son SVG de línea con el mismo trazo que los del menú lateral. En el código, `ico(nombre, tamaño)` dibuja uno de `ICONOS` (gasto, abono, cot, cal, editar, borrar, mas, caja, billetera, tendencia, barras, banco, teléfono, correo, lista, dinero, candado, reloj, alerta, engrane, enlace, cerrar, compartir, guardar, descargar). Las categorías van solo con texto; las cuentas, con su punto de color. Única excepción a propósito: el 🎉 y el 💜 del **mensaje de WhatsApp** al cliente (WhatsApp solo admite texto). Avisos emergentes y confirmaciones van sin emoji (no admiten íconos).

## Estructura del proyecto

| Ruta | Para qué sirve |
|---|---|
| `index.html`, `app.html`, `app-beta.html`, `main.css`, `sw.js`, `manifest*.webmanifest`, `favicon.ico` | La app. **Se quedan en la raíz**: las direcciones de GitHub Pages y la PWA instalada dependen de ellas |
| `icons/` | Íconos de la PWA (`icon-*.png`, `apple-touch-icon.png`) y logos (`caribe.png`) |
| `scripts/desplegar.ps1` | Publica en Firebase lo commiteado, sin archivos sueltos |
| `evidencias/` | Capturas de trabajo, solo local (ignorada por git y por Firebase) |
| `video-demo/` | Videos demo y sus proyectos, **solo en la PC** (ignorada por git y por Firebase desde 2026-11-16) |

## Cómo se publica

- **Lo que ve el usuario:** GitHub Pages — `https://olvezz.github.io/fac-kayra-dev/app.html` (beta: `.../app-beta.html`). Se publica solo con `git push` a `main` (tarda 1–3 min y el navegador lo guarda ~10 min; abrir con `?v=N` para saltar la copia vieja).
- **Firebase Hosting** (`kayra-cotizaciones.web.app`): `powershell -ExecutionPolicy Bypass -File scripts\desplegar.ps1`. Publica lo commiteado (`git archive HEAD`), no la carpeta de trabajo. `firebase.json` excluye `README.md`, `scripts/`, `evidencias/` y `video-demo/`.
- Reglas de Firestore y correos autorizados (`config/accesos`) se gestionan en la consola de Firebase o desde Configuración, no en este repo.
- Subir el número de `main.css?v=...` en `app.html` y `app-beta.html` cada vez que cambie el CSS.

## Pasar cambios de la beta a la original

`app.html` se genera a partir de `app-beta.html` quitando solo lo propio de la beta:

- el `<head>` (título, `manifest.webmanifest`, sin `noindex`) y el cartel naranja "BETA";
- la tarjeta "Herramientas de la BETA" y sus funciones (`cargarDatosPrueba`, `copiarProduccionABeta`, `vaciarBeta`);
- el prefijo de colecciones (`COL_PREFIX = 'beta_'` y los envoltorios de `collection`/`doc`);
- el catálogo ordenado en memoria (la original usa `orderBy`, tiene el índice);
- la sección "Dinero por eventos del mes" del cierre (se queda solo en la beta);
- los atajos del ícono apuntan a `app.html?rapido=…`.

Después de generarla, comparar con `diff` que solo queden esas diferencias y verificar la sintaxis del `<script type="module">`.

## Historial de cambios relevantes

- **2026-11-04 · Base de caja y cierre profesional.** Dashboard, Pagos recibidos y cierres usan fecha de caja. Tarjetas por cuenta con saldo acumulado. Cierre con ingresos fechados y enlazados a su evento, gastos por categoría, saldo por cuenta y eventos con utilidad. Vista en pantalla (ojo), PDF y botón Compartir para PWA.

- **2026-11-05 · Actualización grande (en producción).** Cierre rediseñado para celular (índice, secciones plegables, eventos compactos) y cierre automático el día 1; selector de período con calendario nuevo, selector flotante y Ganancia general; en la cotización, servicios y abonos como tarjetas plegables, buscador de servicios (A–Z) y barra de avance del pago; calendario propio de fechas (marca días con eventos, avisa choques de fecha y hora, bloquea fechas pasadas en cotizaciones nuevas); listas desplegables con diseño propio; correcciones de ancho/scroll en celular; las listas por mes ya no dependen de índices compuestos.
- **2026-11-05 · Segunda tanda.** Lupa en el encabezado de Cotizaciones, Gastos, Clientes, Catálogo y Galería (en celular el buscador baja a su propia fila, filtra mientras se escribe, se esconde si está vacío al bajar el teclado y Enter baja el teclado); filtros en una sola línea con "Limpiar" como ícono; Cierres con selector de mes y botón lado a lado; fechas de las tablas en una sola línea; botón "Agrupar por cotización" más visible; el menú lateral bloquea el scroll del fondo; apartado "Correos autorizados" en Configuración de la app real (antes solo estaba en la beta); protección anti doble toque en guardar, descargar, compartir, exportar y eliminar (`unaVez` / `protegerAcciones` en app.html).
- **2026-11-16 · Registro rápido y calendario (en producción).** Apartado Calendario (mes y lista, con el día de la semana). Botón "+" con Gasto / Abono / Nueva cotización, atajos del ícono, sacudir opcional, guardado sin señal y deshacer. Cuentas y categorías de gastos editables en Configuración (editar, deshabilitar, borrar pasando sus movimientos a otra). Crear servicios del catálogo desde la cotización. Agenda del dashboard en un renglón (Próximos/Recientes + un botón según la pestaña). Tarjeta "Sin asignar" en el cierre. Íconos de línea en lugar de emojis en toda la app. Videos demo fuera del repositorio y del despliegue de Firebase.

## Anuncio de actualización (Registros)

`anunciarActualizacion()` (en `app.html` y `app-beta.html`) guarda UNA entrada en `logs` con id fijo (`ANUNCIO_ID`) la primera vez que alguien abre la app tras publicarla. Para un próximo anuncio: cambiar `ANUNCIO_ID` y `ANUNCIO_TEXTO`.

## Notas de despliegue

- Subir el número de `main.css?v=...` en `app.html` y `app-beta.html` cada vez que cambie el CSS (el celular guarda copias viejas).
- No publicar desde la carpeta de trabajo si tiene archivos sueltos (capturas, etc.): se despliega una carpeta temporal con `git archive HEAD` + los archivos modificados.
- Las consultas con `where` + `orderBy` sobre campos distintos necesitan índice compuesto (la beta no los tiene): ordenar en memoria.
- Con la caché persistente de Firestore, una escritura sin conexión no termina su `await` hasta que vuelve la red: no esperar escrituras sin un tiempo límite en flujos donde la persona necesita respuesta inmediata (ver `qrConEspera`).

## Cambios reversibles

- **Filas del dashboard abren la cotización** (Próximos eventos y Recientes). Para deshacerlo: en `app.html` poner `DASH_FILAS_ABREN_COTIZACION = false`; las filas vuelven a ser solo informativas. Es lo único que hay que tocar.
