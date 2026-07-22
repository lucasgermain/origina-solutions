const http = require('http');

const movimientos = [
  { fecha: '2026-07-20', glosa: 'Transferencia Cliente X', monto: 450000, tipo: 'abono' },
  { fecha: '2026-07-19', glosa: 'Pago Proveedor Y', monto: -180000, tipo: 'cargo' },
  { fecha: '2026-07-18', glosa: 'TEF 88213', monto: -75000, tipo: 'cargo' },
  { fecha: '2026-07-17', glosa: 'Comisión mantención', monto: -8000, tipo: 'cargo' },
];

function construirTabla(lista) {
  const filas = lista.map((m) => `
    <tr>
      <td>${m.fecha}</td>
      <td>${m.glosa}</td>
      <td>${m.monto}</td>
      <td>${m.tipo}</td>
    </tr>
  `).join('');

  return `
    <html>
      <body>
        <h1>Movimientos bancarios (datos de prueba)</h1>
        <table border="1" cellpadding="6">
          <tr><th>Fecha</th><th>Glosa</th><th>Monto</th><th>Tipo</th></tr>
          ${filas}
        </table>
      </body>
    </html>
  `;
}

const servidor = http.createServer((peticion, respuesta) => {
  respuesta.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  respuesta.end(construirTabla(movimientos));
});

servidor.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
