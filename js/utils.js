// ============================================================
// whatsapp.js — genera links de WhatsApp con mensaje pre-cargado
// ============================================================

export function buildWALink(cotizacion, config) {
  const { numero, cliente_nombre, total, fecha_evento, hora_evento, tematica, items = [] } = cotizacion;
  const tel = cotizacion.cliente_telefono
    ? cotizacion.cliente_telefono.replace(/\D/g, '')
    : '';

  const empresa = config?.nombre_negocio || 'Kayra Full Party';
  const lines = [];

  lines.push(`¡Hola ${cliente_nombre}! 🎈✨`);
  lines.push(`Te comparto la *cotización ${numero}* de *${empresa}*.\n`);

  if (fecha_evento) {
    const fe = fecha_evento.toDate ? fecha_evento.toDate() : new Date(fecha_evento);
    const fechaStr = fe.toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const horaStr = hora_evento || '';
    lines.push(`🗓️ *Fecha del evento:* ${fechaStr}${horaStr ? ' · ' + horaStr : ''}`);
  }
  if (tematica) lines.push(`🎨 *Temática:* ${tematica}`);

  if (items.length > 0) {
    lines.push(`\n📋 *Servicios:*`);
    items.slice(0, 6).forEach(it => {
      lines.push(`  • ${it.nombre} ×${it.cantidad} → RD$${Number(it.subtotal).toLocaleString('es-DO')}`);
    });
    if (items.length > 6) lines.push(`  _(+ ${items.length - 6} servicios más)_`);
  }

  lines.push(`\n💰 *Total: RD$${Number(total).toLocaleString('es-DO', { minimumFractionDigits: 2 })}*`);

  if (cotizacion.pdf_url) {
    lines.push(`\n📄 Ver cotización completa:\n${cotizacion.pdf_url}`);
  }

  lines.push(`\nCualquier pregunta, ¡aquí estamos! 💜`);

  const msg = encodeURIComponent(lines.join('\n'));
  const base = tel ? `https://wa.me/${tel}` : `https://wa.me/`;
  return `${base}?text=${msg}`;
}

export function openWhatsApp(cotizacion, config) {
  const url = buildWALink(cotizacion, config);
  window.open(url, '_blank');
}


// ============================================================
// pdf.js — generación de PDF con jsPDF
// ============================================================

export async function generarPDF(cotizacion, config) {
  // Cargar jsPDF dinámicamente
  if (!window.jspdf) {
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const W = 210, M = 14;
  const morado = [165, 36, 139];
  const turquesa = [109, 186, 223];
  const negro = [38, 38, 38];
  const gris = [107, 114, 128];
  const grisClaro = [232, 234, 240];

  let y = 0;

  // ── Header ──
  doc.setFillColor(...morado);
  doc.rect(0, 0, W, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(config?.nombre_negocio || 'Kayra Full Party', M, 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text([
    config?.telefono ? `Tel: ${config.telefono}` : '',
    config?.email    ? config.email : '',
    config?.instagram ? config.instagram : '',
  ].filter(Boolean).join('   ·   '), M, 19);

  // Número de cotización (derecha)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`Cotización`, W - M, 10, { align: 'right' });
  doc.setFontSize(14);
  doc.text(cotizacion.numero, W - M, 18, { align: 'right' });

  y = 36;

  // ── Info emisión + cliente ──
  doc.setTextColor(...negro);

  // Columna izquierda: Fechas
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...gris);
  doc.text('FECHA DE EMISIÓN', M, y);
  doc.text('ESTADO', 70, y);
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...negro);

  const fechaEmision = cotizacion.fecha_emision
    ? (cotizacion.fecha_emision.toDate ? cotizacion.fecha_emision.toDate() : new Date(cotizacion.fecha_emision)).toLocaleDateString('es-DO')
    : new Date().toLocaleDateString('es-DO');
  doc.text(fechaEmision, M, y);

  // Estado badge (simple texto)
  doc.setFont('helvetica', 'bold');
  doc.text(cotizacion.estado || 'Cotización', 70, y);

  y += 10;

  // Fecha del evento
  if (cotizacion.fecha_evento) {
    const fe = cotizacion.fecha_evento.toDate
      ? cotizacion.fecha_evento.toDate()
      : new Date(cotizacion.fecha_evento);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...gris);
    doc.text('FECHA DEL EVENTO', M, y);
    if (cotizacion.hora_evento) doc.text('HORA', 70, y);
    if (cotizacion.tematica)    doc.text('TEMÁTICA', 100, y);
    y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...morado);
    doc.text(fe.toLocaleDateString('es-DO'), M, y);
    if (cotizacion.hora_evento) doc.text(String(cotizacion.hora_evento), 70, y);
    if (cotizacion.tematica)    doc.text(String(cotizacion.tematica), 100, y);
    y += 10;
  }

  // Separador
  doc.setDrawColor(...grisClaro);
  doc.setLineWidth(0.3);
  doc.line(M, y, W - M, y);
  y += 8;

  // ── Datos del cliente ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...gris);
  doc.text('DATOS DEL CLIENTE', M, y);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...negro);
  doc.text(cotizacion.cliente_nombre || '—', M, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...gris);
  const clienteInfo = [
    cotizacion.cliente_telefono,
    cotizacion.cliente_email,
    cotizacion.cliente_direccion,
  ].filter(Boolean).join('   ·   ');
  if (clienteInfo) { y += 5; doc.text(clienteInfo, M, y); }

  y += 12;

  // ── Tabla de servicios ──
  const colWidths = [70, 20, 28, 24, 30]; // Servicio, Cant, P.Unit, Desc%, Subtotal
  const colX = [M];
  colWidths.slice(0, -1).forEach((w, i) => colX.push(colX[i] + w));

  const headers = ['SERVICIO / DESCRIPCIÓN', 'CANT', 'P. UNITARIO', 'DESCUENTO', 'SUBTOTAL'];

  // Header de tabla
  doc.setFillColor(...negro);
  doc.rect(M, y, W - M * 2, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  headers.forEach((h, i) => {
    const align = i > 0 ? 'right' : 'left';
    const x = i === 0 ? colX[i] + 2 : colX[i] + colWidths[i] - 2;
    doc.text(h, x, y + 4.5, { align });
  });
  y += 7;

  // Filas
  const items = cotizacion.items || [];
  items.forEach((item, idx) => {
    if (y > 245) { doc.addPage(); y = 20; }
    const bg = idx % 2 === 0 ? [255,255,255] : [250,250,252];
    doc.setFillColor(...bg);
    doc.rect(M, y, W - M * 2, 8, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...negro);
    doc.text(String(item.nombre || item.servicio || '').substring(0, 38), colX[0] + 2, y + 5);

    doc.setTextColor(...gris);
    doc.text(String(item.cantidad || 1), colX[1] + colWidths[1] - 2, y + 5, { align: 'right' });
    doc.text(`RD$${Number(item.precio_unitario || 0).toLocaleString('es-DO')}`, colX[2] + colWidths[2] - 2, y + 5, { align: 'right' });
    doc.text(item.descuento ? `${item.descuento}%` : '—', colX[3] + colWidths[3] - 2, y + 5, { align: 'right' });

    doc.setTextColor(...negro);
    doc.setFont('helvetica', 'bold');
    doc.text(`RD$${Number(item.subtotal || 0).toLocaleString('es-DO')}`, colX[4] + colWidths[4] - 2, y + 5, { align: 'right' });

    doc.setDrawColor(...grisClaro);
    doc.line(M, y + 8, W - M, y + 8);
    y += 8;
  });

  y += 8;

  // ── Totales ──
  const totalesX = W - M - 70;
  const rows = [
    ['Subtotal',   `RD$${Number(cotizacion.subtotal || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}`],
    ['ITBIS',      `RD$${Number(cotizacion.itbis_monto || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}`],
    ['Transporte', `RD$${Number(cotizacion.transporte || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}`],
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  rows.forEach(([label, val]) => {
    doc.setTextColor(...gris);
    doc.text(label, totalesX, y);
    doc.setTextColor(...negro);
    doc.text(val, W - M, y, { align: 'right' });
    y += 6;
  });

  // Total final
  doc.setFillColor(...morado);
  doc.rect(totalesX - 4, y + 1, W - M - totalesX + 4 + M, 9, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL', totalesX, y + 7);
  doc.text(`RD$${Number(cotizacion.total || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}`,
    W - M, y + 7, { align: 'right' });

  y += 18;

  // Método de pago
  if (cotizacion.metodo_pago) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...gris);
    doc.text(`Método de pago: ${cotizacion.metodo_pago}`, M, y);
    y += 8;
  }

  // Notas
  if (cotizacion.notas) {
    doc.setFillColor(245, 246, 250);
    const notasLines = doc.splitTextToSize(String(cotizacion.notas), W - M * 2 - 8);
    doc.rect(M, y, W - M * 2, notasLines.length * 5 + 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...gris);
    doc.text('NOTAS', M + 4, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...negro);
    doc.text(notasLines, M + 4, y + 10);
    y += notasLines.length * 5 + 14;
  }

  // ── Footer ──
  const footerY = 285;
  doc.setDrawColor(...grisClaro);
  doc.line(M, footerY - 4, W - M, footerY - 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...gris);
  const footerText = `${config?.nombre_negocio || 'Kayra Full Party'}  ·  ${config?.instagram || '@kayrasfullparty'}  ·  ${config?.email || 'kayrafullparty@gmail.com'}  ·  Tel: ${config?.telefono || '(809) 421-8680'}`;
  doc.text(footerText, W / 2, footerY, { align: 'center' });
  doc.setTextColor(...turquesa);
  doc.text('Creamos momentos inolvidables, celebramos cada detalle.', W / 2, footerY + 5, { align: 'center' });

  // ── Generar y descargar ──
  const filename = `${cotizacion.numero}_${(cotizacion.cliente_nombre || 'cliente').replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);

  return filename;
}
