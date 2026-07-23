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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS documentos_venta (
      id SERIAL PRIMARY KEY,
      cliente_id INTEGER NOT NULL REFERENCES clientes(id),
      centro_costo TEXT NOT NULL,
      tipo_dte TEXT NOT NULL,
      monto INTEGER NOT NULL,
      fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
      estado_cobro TEXT NOT NULL DEFAULT 'facturado'
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
    peticion.on('data', (fragmento) => { datos += fragmento; });
    peticion.on('end', () => { resolve(querystring.parse(datos)); });
    peticion.on('error', reject);
  });
}

function leerCuerpoJSON(peticion) {
  return new Promise((resolve, reject) => {
    let datos = '';
    peticion.on('data', (fragmento) => { datos += fragmento; });
    peticion.on('end', () => {
      try {
        resolve(datos ? JSON.parse(datos) : {});
      } catch (error) {
        reject(error);
      }
    });
    peticion.on('error', reject);
  });
}

function aplicarCORS(respuesta) {
  respuesta.setHeader('Access-Control-Allow-Origin', '*');
  respuesta.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  respuesta.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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
        <p><a href="/">Movimientos bancarios</a> | <a href="/ventas">Ventas</a></p>
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

function construirPaginaVentas(lista, clientes) {
  const opcionesClientes = clientes.map((c) => `<option value="${c.id}">${c.nombre}</option>`).join('');

  const filas = lista.map((v) => `
    <tr>
      <td>${v.cliente_nombre}</td>
      <td>${v.tipo_dte}</td>
      <td>${v.monto}</td>
      <td>${v.fecha_emision.toISOString().slice(0, 10)}</td>
      <td>${v.centro_costo}</td>
      <td>${v.estado_cobro}</td>
    </tr>
  `).join('');

  return `
    <html>
      <body>
        <h1>Documentos de venta</h1>
        <p><a href="/">Movimientos bancarios</a> | <a href="/clientes">Clientes</a></p>
        <form method="POST" action="/ventas">
          <label>Cliente:
            <select name="clienteId" required>
              <option value="">-- elegir --</option>
              ${opcionesClientes}
            </select>
          </label>
          <label>Tipo:
            <select name="tipoDte">
              <option value="boleta">Boleta</option>
              <option value="factura">Factura</option>
            </select>
          </label>
          <label>Monto: <input type="number" name="monto" required></label>
          <label>Centro de costo:
            <select name="centroCosto">
              <option>Providencia</option>
              <option>Ñuñoa</option>
            </select>
          </label>
          <button type="submit">Registrar venta</button>
        </form>
        <table border="1" cellpadding="6">
          <tr><th>Cliente</th><th>Tipo</th><th>Monto</th><th>Fecha</th><th>Centro de costo</th><th>Estado cobro</th></tr>
          ${filas}
        </table>
      </body>
    </html>
  `;
}

const servidor = http.createServer(async (peticion, respuesta) => {
  const partesUrl = url.parse(peticion.url, true);
  const ruta = partesUrl.pathname;

  aplicarCORS(respuesta);

  if (peticion.method === 'OPTIONS') {
    respuesta.writeHead(204);
    respuesta.end();
    return;
  }

  if (ruta === '/api/clientes' && peticion.method === 'GET') {
    const resultado = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
    respuesta.writeHead(200, { 'Content-Type': 'application/json' });
    respuesta.end(JSON.stringify(resultado.rows));
    return;
  }

  if (ruta === '/api/clientes' && peticion.method === 'POST') {
    const cuerpo = await leerCuerpoJSON(peticion);
    const resultado = await pool.query(
      'INSERT INTO clientes (rut, nombre, centro_costo) VALUES ($1, $2, $3) RETURNING *',
      [cuerpo.rut, cuerpo.nombre, cuerpo.centroCosto]
    );
    respuesta.writeHead(201, { 'Content-Type': 'application/json' });
    respuesta.end(JSON.stringify(resultado.rows[0]));
    return;
  }

  if (ruta === '/ventas' && peticion.method === 'POST') {
    const cuerpo = await leerCuerpo(peticion);
    await pool.query(
      'INSERT INTO documentos_venta (cliente_id, centro_costo, tipo_dte, monto) VALUES ($1, $2, $3, $4)',
      [cuerpo.clienteId, cuerpo.centroCosto, cuerpo.tipoDte, cuerpo.monto]
    );
    respuesta.writeHead(302, { Location: '/ventas' });
    respuesta.end();
    return;
  }

  if (ruta === '/ventas') {
    const clientes = await pool.query('SELECT * FROM clientes ORDER BY nombre');
    const ventas = await pool.query(`
      SELECT documentos_venta.*, clientes.nombre AS cliente_nombre
      FROM documentos_venta
      JOIN clientes ON clientes.id = documentos_venta.cliente_id
      ORDER BY documentos_venta.id DESC
    `);
    respuesta.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    respuesta.end(construirPaginaVentas(ventas.rows, clientes.rows));
    return;
  }

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
        <p><a href="/clientes">Clientes</a> | <a href="/ventas">Ventas</a></p>
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