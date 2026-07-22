const http = require('http');
const url = require('url');

const movimientos = [
  { fecha: '2026-07-20', glosa: 'Transferencia Cliente X', monto: 450000, tipo: 'abono', centroCosto: 'Providencia' },
  { fecha: '2026-07-19', glosa: 'Pago Proveedor Y', monto: -180000, tipo: 'cargo', centroCosto: 'Providencia' },
  { fecha: '2026-07-18', glosa: 'TEF 88213', monto: -75000, tipo: 'cargo', centroCosto: 'Ñuñoa' },
  { fecha: '2026-07-17', glosa: 'Comisión mantención', monto: -8000, tipo: 'cargo', centroCosto: 'Overhead' },
];

function construirSelector(centroCostoActual) {
  const centros = ['Todos', 'Providencia', 'Ñuñoa', 'Overhead'];
  const opciones = centros.map((c) => {
    const seleccionado = c === centroCostoActual ? 'selected' : '';
    return `<option value="${c}" ${seleccionado}>${c}</option>`;
  }).join('');

  return `
    <form method="GET">
      <label>Centro de costo:
        <select name="centroCosto" onchange="this.form.submit()">
          ${opciones}
        </select>
      </label>
    </form>
  `;
}

function construirTabla(lista) {
  const filas = lista.map((m) => `
    <tr>
      <td>${m.fecha}</td>
      <td>${m.glosa}</td>
      <td>${m.monto}</td>
      <td>${m.tipo}</td>
      <td>${m.centroCosto}</td>
    </tr>
  `).join('');

  return `
    <table border="1" cellpadding="6">
      <tr><th>Fecha</th><th>Glosa</th><th>Monto</th><th>Tipo</th><th>Centro de costo</th></tr>
      ${filas}
    </table>
  `;
}

const servidor = http.createServer((peticion, respuesta) => {
  const partesUrl = url.parse(peticion.url, true);
  const centroCostoElegido = partesUrl.query.centroCosto || 'Todos';

  const movimientosFiltrados = centroCostoElegido === 'Todos'
    ? movimientos
    : movimientos.filter((m) => m.centroCosto === centroCostoElegido);

  respuesta.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  respuesta.end(`
    <html>
      <body>
        <h1>Movimientos bancarios por centro de costo</h1>
        ${construirSelector(centroCostoElegido)}
        ${construirTabla(movimientosFiltrados)}
      </body>
    </html>
  `);
});

servidor.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});