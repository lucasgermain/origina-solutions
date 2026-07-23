const http = require('http');
const url = require('url');
const querystring = require('querystring');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'centrocontrol',
  password: 'centrocontrol',
  database: 'centrocontrol',
});

async function prepararBaseDeDatos() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS movimientos_bancarios (
      id SERIAL PRIMARY KEY,
      fecha DATE NOT NULL,
      glosa TEXT NOT NULL,
      monto INTEGER NOT NULL,
      tipo TEXT NOT NULL,
      centro_costo TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS clientes (
      id SERIAL PRIMARY KEY,
      rut TEXT NOT NULL,
      nombre TEXT NOT NULL,
      centro_costo TEXT NOT NULL
    );
  `);

  const { rows } = await pool.query('SELECT COUNT(*) FROM movimientos_bancarios');
  const yaTieneDatos = Number(rows[0].count) > 0;

  if (!yaTieneDatos) {
    await pool.query(`
      INSERT INTO movimientos_bancarios (fecha, glosa, monto, tipo, centro_costo) VALUES
      ('2026-07-20', 'Transferencia Cliente X', 450000, 'abono', 'Providencia'),
      ('2026-07-19', 'Pago Proveedor Y', -180000, 'cargo', 'Providencia'),
      ('2026-07-18', 'TEF 88213', -75000, 'cargo', 'Ñuñoa'),
      ('2026-07-17', 'Comisión mantención', -8000, 'cargo', 'Overhead');
    `);
    console.log('Datos de prueba insertados.');
  }
}

function leerCuerpo(peticion) {
  return new Promise((resolve, reject) => {
    let datos = '';
    peticion.on('data', (fragmento) => {
      datos += fragmento;
    });
    peticion.on('end', () => {
      resolve(querystring.parse(datos));
    });
    peticion.on('error', reject);
  });
}

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

function construirTablaMovimientos(lista) {
  const filas = lista.map((m) => `
    <tr>
      <td>${m.fecha.toISOString().slice(0, 10)}</td>
      <td>${m.glosa}</td>
      <td>${m.monto}</td>
      <td>${m.tipo}</td>
      <td>${m.centro_costo}</td>
    </tr>
  `).join('');

  return `
    <table border="1" cellpadding="6">
      <tr><th>Fecha</th><th>Glosa</th><th>Monto</th><th>Tipo</th><th>Centro de costo</th></tr>
      ${filas}
    </table>
  `;
}

function construirPaginaClientes(lista) {
  const filas = lista.map((c) => `
    <tr>
      <td>${c.rut}</td>
      <td>${c.nombre}</td>
      <td>${c.centro_costo}</td>
    </tr>
  `).join('');

  return `
    <html>
      <body>
        <h1>Clientes</h1>
        <p><a href="/">Volver a movimientos bancarios</a></p>
        <form method="POST" action="/clientes">
          <label>RUT: <input type="text" name="rut" required></label>
          <label>Nombre: <input type="text" name="nombre" required></label>
          <label>Centro de costo:
            <select name="centroCosto">
              <option>Providencia</option>
              <option>Ñuñoa</option>
            </select>
          </label>
          <button type="submit">Agregar cliente</button>
        </form>
        <table border="1" cellpadding="6">
          <tr><th>RUT</th><th>Nombre</th><th>Centro de costo</th></tr>
          ${filas}
        </table>
      </body>
    </html>
  `;
}

const servidor = http.createServer(async (peticion, respuesta) => {
  const partesUrl = url.parse(peticion.url, true);
  const ruta = partesUrl.pathname;

  if (ruta === '/clientes' && peticion.method === 'POST') {
    const cuerpo = await leerCuerpo(peticion);
    await pool.query(
      'INSERT INTO clientes (rut, nombre, centro_costo) VALUES ($1, $2, $3)',
      [cuerpo.rut, cuerpo.nombre, cuerpo.centroCosto]
    );
    respuesta.writeHead(302, { Location: '/clientes' });
    respuesta.end();
    return;
  }

  if (ruta === '/clientes') {
    const resultado = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
    respuesta.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    respuesta.end(construirPaginaClientes(resultado.rows));
    return;
  }

  const centroCostoElegido = partesUrl.query.centroCosto || 'Todos';
  let resultado;
  if (centroCostoElegido === 'Todos') {
    resultado = await pool.query('SELECT * FROM movimientos_bancarios ORDER BY fecha DESC');
  } else {
    resultado = await pool.query(
      'SELECT * FROM movimientos_bancarios WHERE centro_costo = $1 ORDER BY fecha DESC',
      [centroCostoElegido]
    );
  }

  respuesta.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  respuesta.end(`
    <html>
      <body>
        <h1>Movimientos bancarios por centro de costo</h1>
        <p><a href="/clientes">Ir a Clientes</a></p>
        ${construirSelector(centroCostoElegido)}
        ${construirTablaMovimientos(resultado.rows)}
      </body>
    </html>
  `);
});

prepararBaseDeDatos()
  .then(() => {
    servidor.listen(3000, () => {
      console.log('Servidor corriendo en http://localhost:3000');
    });
  })
  .catch((error) => {
    console.error('Error preparando la base de datos:', error);
  });