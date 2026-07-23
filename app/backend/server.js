require('dotenv').config();

const http = require('http');
const url = require('url');
const querystring = require('querystring');
const { Pool, types } = require('pg');

// Por defecto, `pg` convierte las columnas DATE a objetos Date de
// JavaScript, y al pasarlas por JSON.stringify (nuestras rutas /api/...)
// terminan mostrando fecha y hora ("2026-07-23T00:00:00.000Z") en vez de
// solo la fecha. Como esta app nunca guarda hora en columnas DATE, le
// pedimos a `pg` que las devuelva tal cual (el texto "2026-07-23" que ya
// entrega Postgres), sin convertir. OID 1082 = tipo "date" de Postgres.
types.setTypeParser(1082, (valor) => valor);

// Las credenciales ya no están escritas acá — se leen desde app/backend/.env
// (que nunca se sube a git). Los valores después de "||" son solo un
// respaldo para que el proyecto siga funcionando si alguien no tiene el
// archivo .env todavía.
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER || 'centrocontrol',
  password: process.env.PGPASSWORD || 'centrocontrol',
  database: process.env.PGDATABASE || 'centrocontrol',
});

const FINTOC_API = 'https://api.fintoc.com/v1';

// Llama directo a la API REST de Fintoc (en vez de usar el SDK oficial),
// siguiendo la paginación (header "Link") nosotros mismos, con un tope de
// páginas de seguridad para nunca quedar pegados en un loop infinito.
async function fintocGetTodasLasPaginas(rutaInicial) {
  const elementos = [];
  let siguienteUrl = `${FINTOC_API}${rutaInicial}`;
  let paginas = 0;

  while (siguienteUrl && paginas < 10) {
    const respuesta = await fetch(siguienteUrl, {
      headers: { Authorization: process.env.FINTOC_SECRET_KEY },
    });
    if (!respuesta.ok) {
      throw new Error(`Fintoc respondió ${respuesta.status} al pedir ${siguienteUrl}`);
    }
    const datos = await respuesta.json();
    elementos.push(...datos);

    const linkHeader = respuesta.headers.get('link');
    const match = linkHeader && linkHeader.match(/<([^>]+)>;\s*rel="next"/);
    siguienteUrl = match ? match[1] : null;
    paginas++;
  }

  return elementos;
}

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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sku (
      id SERIAL PRIMARY KEY,
      codigo TEXT NOT NULL UNIQUE,
      descripcion TEXT NOT NULL,
      costo_promedio NUMERIC(14,2) NOT NULL DEFAULT 0
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS movimientos_inventario (
      id SERIAL PRIMARY KEY,
      sku_id INTEGER NOT NULL REFERENCES sku(id),
      centro_costo TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'salida', 'merma', 'traspaso')),
      cantidad NUMERIC(12,2) NOT NULL,
      costo_unitario NUMERIC(14,2),
      fecha DATE NOT NULL DEFAULT CURRENT_DATE
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS empleados (
      id SERIAL PRIMARY KEY,
      rut TEXT NOT NULL,
      nombre TEXT NOT NULL,
      cargo TEXT NOT NULL,
      centro_costo TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS liquidaciones (
      id SERIAL PRIMARY KEY,
      empleado_id INTEGER NOT NULL REFERENCES empleados(id),
      periodo TEXT NOT NULL,
      sueldo_liquido NUMERIC(14,2) NOT NULL,
      sueldo_imponible NUMERIC(14,2) NOT NULL,
      cotizaciones NUMERIC(14,2) NOT NULL,
      estado_pago TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'pagado'))
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS deudas_leasing (
      id SERIAL PRIMARY KEY,
      centro_costo TEXT,
      tipo TEXT NOT NULL CHECK (tipo IN ('credito_comercial', 'linea_credito', 'leasing_financiero', 'leasing_operativo', 'factoring')),
      acreedor TEXT NOT NULL,
      monto_original NUMERIC(14,2) NOT NULL,
      tasa_interes NUMERIC(6,4) NOT NULL,
      plazo_meses INTEGER NOT NULL,
      fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cuotas_deuda (
      id SERIAL PRIMARY KEY,
      deuda_leasing_id INTEGER NOT NULL REFERENCES deudas_leasing(id),
      numero_cuota INTEGER NOT NULL,
      fecha_vencimiento DATE NOT NULL,
      capital NUMERIC(14,2) NOT NULL,
      interes NUMERIC(14,2) NOT NULL,
      estado_pago TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'pagado'))
    );
  `);

  // Columnas agregadas después (Fase 3, capítulo 6): vinculan una venta con el
  // SKU vendido, para poder calcular el margen. Nullable porque las ventas
  // registradas antes de este capítulo no tienen esta información.
  await pool.query(`ALTER TABLE documentos_venta ADD COLUMN IF NOT EXISTS sku_id INTEGER REFERENCES sku(id);`);
  await pool.query(`ALTER TABLE documentos_venta ADD COLUMN IF NOT EXISTS cantidad NUMERIC(12,2);`);
  await pool.query(`ALTER TABLE documentos_venta ADD COLUMN IF NOT EXISTS costo_unitario NUMERIC(14,2);`);

  // Fase 5: columna para no duplicar movimientos al sincronizar con Fintoc
  // más de una vez (cada movimiento de Fintoc trae un id único, ej. "mov_...").
  await pool.query(`ALTER TABLE movimientos_bancarios ADD COLUMN IF NOT EXISTS fintoc_id TEXT UNIQUE;`);

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

// Trae los movimientos reales (de sandbox, por ahora) desde Fintoc y los
// guarda en movimientos_bancarios. Fintoc no sabe nada de "centro de costo"
// —eso es un concepto propio de este proyecto—, así que cada movimiento
// nuevo entra con centro_costo = 'Sin asignar', pendiente de que alguien lo
// clasifique a mano (ver /api/movimientos/:id/centro-costo más abajo).
async function sincronizarConFintoc() {
  if (!process.env.FINTOC_SECRET_KEY) {
    throw new Error('Falta FINTOC_SECRET_KEY en app/backend/.env');
  }
  if (!process.env.FINTOC_LINK_TOKEN) {
    throw new Error('Falta FINTOC_LINK_TOKEN en app/backend/.env');
  }

  const linkToken = process.env.FINTOC_LINK_TOKEN;

  console.log('Fintoc: pidiendo cuentas del Link...');
  const cuentas = await fintocGetTodasLasPaginas(`/accounts?link_token=${linkToken}`);
  console.log(`Fintoc: ${cuentas.length} cuenta(s) encontrada(s).`);

  let movimientosNuevos = 0;

  for (const cuenta of cuentas) {
    console.log(`Fintoc: pidiendo movimientos de la cuenta ${cuenta.id}...`);
    const movimientos = await fintocGetTodasLasPaginas(
      `/accounts/${cuenta.id}/movements?link_token=${linkToken}`
    );
    console.log(`Fintoc: ${movimientos.length} movimiento(s) encontrado(s) en esa cuenta.`);

    for (const movimiento of movimientos) {
      const resultado = await pool.query(
        `INSERT INTO movimientos_bancarios (fecha, glosa, monto, tipo, centro_costo, fintoc_id)
         VALUES ($1, $2, $3, $4, 'Sin asignar', $5)
         ON CONFLICT (fintoc_id) DO NOTHING
         RETURNING id`,
        [
          new Date(movimiento.post_date).toISOString().slice(0, 10),
          movimiento.description,
          Math.round(movimiento.amount),
          movimiento.amount >= 0 ? 'abono' : 'cargo',
          movimiento.id,
        ]
      );
      if (resultado.rows.length > 0) movimientosNuevos++;
    }
  }

  return { movimientosNuevos };
}

function sumarDias(fecha, dias) {
  const nueva = new Date(fecha);
  nueva.setDate(nueva.getDate() + dias);
  return nueva;
}

function ultimoDiaDelPeriodo(periodo) {
  // periodo viene como "AAAA-MM". El día 0 del mes siguiente es el último
  // día del mes actual — es un truco estándar del objeto Date de JS.
  const [anio, mes] = periodo.split('-').map(Number);
  return new Date(anio, mes, 0);
}

function aFechaCorta(fecha) {
  return fecha.toISOString().slice(0, 10);
}

// Cruza cuatro fuentes de datos —saldo bancario, facturas por cobrar, cuotas
// de deuda y liquidaciones pendientes— para proyectar el saldo día a día y
// avisar si en algún punto del horizonte la caja se pondría en rojo.
async function calcularProyeccionCaja(dias) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const horizonte = sumarDias(hoy, dias);

  const saldoResultado = await pool.query('SELECT COALESCE(SUM(monto), 0) AS saldo FROM movimientos_bancarios');
  const saldoActual = Number(saldoResultado.rows[0].saldo);

  const eventos = [];

  // Facturas pendientes de cobro: se asume un plazo de pago a 30 días desde
  // la emisión (término comercial típico en Chile). Las boletas se tratan
  // como cobradas al contado y no entran a la proyección.
  const ventas = await pool.query(`
    SELECT documentos_venta.*, clientes.nombre AS cliente_nombre
    FROM documentos_venta
    JOIN clientes ON clientes.id = documentos_venta.cliente_id
    WHERE tipo_dte = 'factura'
  `);
  for (const venta of ventas.rows) {
    const fechaCobro = sumarDias(venta.fecha_emision, 30);
    if (fechaCobro >= hoy && fechaCobro <= horizonte) {
      eventos.push({
        fecha: fechaCobro,
        concepto: `Cobro factura #${venta.id} — ${venta.cliente_nombre}`,
        monto: Number(venta.monto),
      });
    }
  }

  // Cuotas de deuda pendientes dentro del horizonte.
  const cuotas = await pool.query(`
    SELECT cuotas_deuda.*, deudas_leasing.acreedor
    FROM cuotas_deuda
    JOIN deudas_leasing ON deudas_leasing.id = cuotas_deuda.deuda_leasing_id
    WHERE estado_pago = 'pendiente'
      AND fecha_vencimiento BETWEEN $1 AND $2
  `, [aFechaCorta(hoy), aFechaCorta(horizonte)]);
  for (const cuota of cuotas.rows) {
    eventos.push({
      fecha: new Date(cuota.fecha_vencimiento),
      concepto: `Cuota ${cuota.numero_cuota} — ${cuota.acreedor}`,
      monto: -(Number(cuota.capital) + Number(cuota.interes)),
    });
  }

  // Liquidaciones pendientes: se asume que el sueldo se paga el último día
  // del mes del periodo liquidado.
  const liquidaciones = await pool.query(`
    SELECT liquidaciones.*, empleados.nombre AS empleado_nombre
    FROM liquidaciones
    JOIN empleados ON empleados.id = liquidaciones.empleado_id
    WHERE estado_pago = 'pendiente'
  `);
  for (const liquidacion of liquidaciones.rows) {
    const fechaPago = ultimoDiaDelPeriodo(liquidacion.periodo);
    if (fechaPago >= hoy && fechaPago <= horizonte) {
      eventos.push({
        fecha: fechaPago,
        concepto: `Sueldo — ${liquidacion.empleado_nombre}`,
        monto: -Number(liquidacion.sueldo_liquido),
      });
    }
  }

  eventos.sort((a, b) => a.fecha - b.fecha);

  let saldo = saldoActual;
  let alerta = null;
  for (const evento of eventos) {
    saldo += evento.monto;
    evento.saldoProyectado = saldo;
    evento.fecha = aFechaCorta(evento.fecha);
    if (saldo < 0 && !alerta) {
      alerta = { fecha: evento.fecha, saldoProyectado: saldo };
    }
  }

  return { saldoActual, horizonteDias: dias, eventos, alerta };
}

async function registrarMovimientoInventario(cuerpo) {
  const { skuId, centroCosto, tipo, cantidad, costoUnitario } = cuerpo;

  // Guardamos el movimiento tal cual llegó.
  await pool.query(
    'INSERT INTO movimientos_inventario (sku_id, centro_costo, tipo, cantidad, costo_unitario) VALUES ($1, $2, $3, $4, $5)',
    [skuId, centroCosto, tipo, cantidad, tipo === 'entrada' ? costoUnitario : null]
  );

  // Solo una "entrada" (compra de stock) cambia el costo promedio del SKU.
  // Es el Precio Medio Ponderado (PMP): se pondera el costo que ya tenía el
  // stock existente con el costo de lo que acaba de entrar.
  if (tipo === 'entrada') {
    const sku = await pool.query('SELECT costo_promedio FROM sku WHERE id = $1', [skuId]);
    const stockActual = await calcularStock(skuId);
    const costoPromedioActual = Number(sku.rows[0].costo_promedio);
    const cantidadEntrada = Number(cantidad);
    const costoEntrada = Number(costoUnitario);

    const stockAntesDeEsteMovimiento = stockActual - cantidadEntrada;
    const nuevoPmp =
      stockAntesDeEsteMovimiento > 0
        ? (stockAntesDeEsteMovimiento * costoPromedioActual + cantidadEntrada * costoEntrada) /
          stockActual
        : costoEntrada;

    await pool.query('UPDATE sku SET costo_promedio = $1 WHERE id = $2', [nuevoPmp, skuId]);
  }
}

async function calcularStock(skuId) {
  const resultado = await pool.query(
    `
      SELECT COALESCE(SUM(
        CASE
          WHEN tipo = 'entrada' THEN cantidad
          WHEN tipo IN ('salida', 'merma') THEN -cantidad
          ELSE 0
        END
      ), 0) AS stock
      FROM movimientos_inventario
      WHERE sku_id = $1
    `,
    [skuId]
  );
  return Number(resultado.rows[0].stock);
}

async function registrarVenta(cuerpo) {
  const { clienteId, centroCosto, tipoDte, monto, skuId, cantidad } = cuerpo;

  // Si la venta lleva un SKU, "congelamos" el costo promedio vigente en ese
  // instante como costo_unitario de esta venta. Así el margen de una venta
  // vieja no cambia si el costo promedio del SKU sigue moviéndose después.
  let costoUnitario = null;
  if (skuId) {
    const sku = await pool.query('SELECT costo_promedio FROM sku WHERE id = $1', [skuId]);
    costoUnitario = sku.rows[0].costo_promedio;
  }

  const resultado = await pool.query(
    `INSERT INTO documentos_venta (cliente_id, centro_costo, tipo_dte, monto, sku_id, cantidad, costo_unitario)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [clienteId, centroCosto, tipoDte, monto, skuId || null, cantidad || null, costoUnitario]
  );

  // La venta de un SKU también es una salida de inventario: se registra
  // aparte para que el stock (calculado desde movimientos_inventario) quede
  // al día automáticamente.
  if (skuId) {
    await registrarMovimientoInventario({ skuId, centroCosto, tipo: 'salida', cantidad });
  }

  return resultado.rows[0];
}

async function registrarDeuda(cuerpo) {
  const { centroCosto, tipo, acreedor, montoOriginal, tasaInteres, plazoMeses, fechaInicio } = cuerpo;

  const deuda = await pool.query(
    `INSERT INTO deudas_leasing (centro_costo, tipo, acreedor, monto_original, tasa_interes, plazo_meses, fecha_inicio)
     VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, CURRENT_DATE)) RETURNING *`,
    [centroCosto || null, tipo, acreedor, montoOriginal, tasaInteres, plazoMeses, fechaInicio || null]
  );

  await generarTablaDeAmortizacion(deuda.rows[0]);

  return deuda.rows[0];
}

// Sistema francés: la cuota (capital + interés) es siempre el mismo monto;
// lo que cambia mes a mes es cuánto de esa cuota es interés (baja con el
// tiempo) y cuánto es capital (sube con el tiempo), porque el interés se
// calcula sobre el saldo que va quedando.
async function generarTablaDeAmortizacion(deuda) {
  const monto = Number(deuda.monto_original);
  const tasa = Number(deuda.tasa_interes); // tasa mensual, ej. 0.015 = 1,5%
  const plazo = Number(deuda.plazo_meses);
  const fechaInicio = new Date(deuda.fecha_inicio);

  const cuotaFija =
    tasa > 0 ? (monto * tasa) / (1 - Math.pow(1 + tasa, -plazo)) : monto / plazo;

  let saldoPendiente = monto;

  for (let numero = 1; numero <= plazo; numero++) {
    const interes = saldoPendiente * tasa;
    const capital = cuotaFija - interes;
    saldoPendiente -= capital;

    const fechaVencimiento = new Date(fechaInicio);
    fechaVencimiento.setMonth(fechaVencimiento.getMonth() + numero);

    await pool.query(
      `INSERT INTO cuotas_deuda (deuda_leasing_id, numero_cuota, fecha_vencimiento, capital, interes)
       VALUES ($1, $2, $3, $4, $5)`,
      [deuda.id, numero, fechaVencimiento.toISOString().slice(0, 10), capital, interes]
    );
  }
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
      <td>${m.fecha}</td>
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
      <td>${v.fecha_emision}</td>
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

  if (ruta === '/api/skus' && peticion.method === 'GET') {
    const resultado = await pool.query(`
      SELECT sku.*, COALESCE(SUM(
        CASE
          WHEN mi.tipo = 'entrada' THEN mi.cantidad
          WHEN mi.tipo IN ('salida', 'merma') THEN -mi.cantidad
          ELSE 0
        END
      ), 0) AS stock
      FROM sku
      LEFT JOIN movimientos_inventario mi ON mi.sku_id = sku.id
      GROUP BY sku.id
      ORDER BY sku.codigo
    `);
    respuesta.writeHead(200, { 'Content-Type': 'application/json' });
    respuesta.end(JSON.stringify(resultado.rows));
    return;
  }

  if (ruta === '/api/skus' && peticion.method === 'POST') {
    const cuerpo = await leerCuerpoJSON(peticion);
    const resultado = await pool.query(
      'INSERT INTO sku (codigo, descripcion) VALUES ($1, $2) RETURNING *',
      [cuerpo.codigo, cuerpo.descripcion]
    );
    respuesta.writeHead(201, { 'Content-Type': 'application/json' });
    respuesta.end(JSON.stringify(resultado.rows[0]));
    return;
  }

  if (ruta === '/api/movimientos-inventario' && peticion.method === 'POST') {
    const cuerpo = await leerCuerpoJSON(peticion);
    await registrarMovimientoInventario(cuerpo);
    respuesta.writeHead(201, { 'Content-Type': 'application/json' });
    respuesta.end(JSON.stringify({ ok: true }));
    return;
  }

  if (ruta === '/api/movimientos-bancarios' && peticion.method === 'GET') {
    const resultado = await pool.query('SELECT * FROM movimientos_bancarios ORDER BY fecha DESC, id DESC');
    respuesta.writeHead(200, { 'Content-Type': 'application/json' });
    respuesta.end(JSON.stringify(resultado.rows));
    return;
  }

  if (ruta === '/api/sincronizar-fintoc' && peticion.method === 'POST') {
    try {
      const resultado = await sincronizarConFintoc();
      respuesta.writeHead(200, { 'Content-Type': 'application/json' });
      respuesta.end(JSON.stringify(resultado));
    } catch (error) {
      respuesta.writeHead(500, { 'Content-Type': 'application/json' });
      respuesta.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  const matchCentroCosto = ruta.match(/^\/api\/movimientos\/(\d+)\/centro-costo$/);
  if (matchCentroCosto && peticion.method === 'POST') {
    const cuerpo = await leerCuerpoJSON(peticion);
    const resultado = await pool.query(
      'UPDATE movimientos_bancarios SET centro_costo = $1 WHERE id = $2 RETURNING *',
      [cuerpo.centroCosto, matchCentroCosto[1]]
    );
    respuesta.writeHead(200, { 'Content-Type': 'application/json' });
    respuesta.end(JSON.stringify(resultado.rows[0]));
    return;
  }

  if (ruta === '/api/proyeccion-caja' && peticion.method === 'GET') {
    const dias = Number(partesUrl.query.dias) || 90;
    const proyeccion = await calcularProyeccionCaja(dias);
    respuesta.writeHead(200, { 'Content-Type': 'application/json' });
    respuesta.end(JSON.stringify(proyeccion));
    return;
  }

  if (ruta === '/api/deudas' && peticion.method === 'GET') {
    const resultado = await pool.query(`
      SELECT
        deudas_leasing.*,
        COALESCE(SUM(cuotas_deuda.capital) FILTER (WHERE cuotas_deuda.estado_pago = 'pendiente'), 0) AS saldo_pendiente,
        MIN(cuotas_deuda.fecha_vencimiento) FILTER (WHERE cuotas_deuda.estado_pago = 'pendiente') AS proxima_cuota
      FROM deudas_leasing
      LEFT JOIN cuotas_deuda ON cuotas_deuda.deuda_leasing_id = deudas_leasing.id
      GROUP BY deudas_leasing.id
      ORDER BY deudas_leasing.fecha_inicio DESC
    `);
    respuesta.writeHead(200, { 'Content-Type': 'application/json' });
    respuesta.end(JSON.stringify(resultado.rows));
    return;
  }

  if (ruta === '/api/deudas' && peticion.method === 'POST') {
    const cuerpo = await leerCuerpoJSON(peticion);
    const deuda = await registrarDeuda(cuerpo);
    respuesta.writeHead(201, { 'Content-Type': 'application/json' });
    respuesta.end(JSON.stringify(deuda));
    return;
  }

  const matchCuotas = ruta.match(/^\/api\/deudas\/(\d+)\/cuotas$/);
  if (matchCuotas && peticion.method === 'GET') {
    const resultado = await pool.query(
      `
        SELECT *,
          CASE
            WHEN estado_pago = 'pendiente' AND fecha_vencimiento < CURRENT_DATE THEN 'vencido'
            ELSE estado_pago
          END AS estado_mostrado
        FROM cuotas_deuda
        WHERE deuda_leasing_id = $1
        ORDER BY numero_cuota
      `,
      [matchCuotas[1]]
    );
    respuesta.writeHead(200, { 'Content-Type': 'application/json' });
    respuesta.end(JSON.stringify(resultado.rows));
    return;
  }

  if (ruta.match(/^\/api\/cuotas\/\d+\/pagar$/) && peticion.method === 'POST') {
    const id = ruta.split('/')[3];
    const resultado = await pool.query(
      "UPDATE cuotas_deuda SET estado_pago = 'pagado' WHERE id = $1 RETURNING *",
      [id]
    );
    respuesta.writeHead(200, { 'Content-Type': 'application/json' });
    respuesta.end(JSON.stringify(resultado.rows[0]));
    return;
  }

  if (ruta === '/api/empleados' && peticion.method === 'GET') {
    const resultado = await pool.query('SELECT * FROM empleados ORDER BY nombre');
    respuesta.writeHead(200, { 'Content-Type': 'application/json' });
    respuesta.end(JSON.stringify(resultado.rows));
    return;
  }

  if (ruta === '/api/empleados' && peticion.method === 'POST') {
    const cuerpo = await leerCuerpoJSON(peticion);
    const resultado = await pool.query(
      'INSERT INTO empleados (rut, nombre, cargo, centro_costo) VALUES ($1, $2, $3, $4) RETURNING *',
      [cuerpo.rut, cuerpo.nombre, cuerpo.cargo, cuerpo.centroCosto]
    );
    respuesta.writeHead(201, { 'Content-Type': 'application/json' });
    respuesta.end(JSON.stringify(resultado.rows[0]));
    return;
  }

  if (ruta === '/api/liquidaciones' && peticion.method === 'GET') {
    const resultado = await pool.query(`
      SELECT liquidaciones.*, empleados.nombre AS empleado_nombre, empleados.centro_costo
      FROM liquidaciones
      JOIN empleados ON empleados.id = liquidaciones.empleado_id
      ORDER BY liquidaciones.periodo DESC, empleados.nombre
    `);
    respuesta.writeHead(200, { 'Content-Type': 'application/json' });
    respuesta.end(JSON.stringify(resultado.rows));
    return;
  }

  if (ruta === '/api/liquidaciones' && peticion.method === 'POST') {
    const cuerpo = await leerCuerpoJSON(peticion);
    const resultado = await pool.query(
      `INSERT INTO liquidaciones (empleado_id, periodo, sueldo_liquido, sueldo_imponible, cotizaciones)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [cuerpo.empleadoId, cuerpo.periodo, cuerpo.sueldoLiquido, cuerpo.sueldoImponible, cuerpo.cotizaciones]
    );
    respuesta.writeHead(201, { 'Content-Type': 'application/json' });
    respuesta.end(JSON.stringify(resultado.rows[0]));
    return;
  }

  if (ruta.match(/^\/api\/liquidaciones\/\d+\/pagar$/) && peticion.method === 'POST') {
    const id = ruta.split('/')[3];
    const resultado = await pool.query(
      "UPDATE liquidaciones SET estado_pago = 'pagado' WHERE id = $1 RETURNING *",
      [id]
    );
    respuesta.writeHead(200, { 'Content-Type': 'application/json' });
    respuesta.end(JSON.stringify(resultado.rows[0]));
    return;
  }

  if (ruta === '/api/ventas' && peticion.method === 'GET') {
    const resultado = await pool.query(`
      SELECT
        documentos_venta.*,
        clientes.nombre AS cliente_nombre,
        sku.codigo AS sku_codigo,
        CASE
          WHEN documentos_venta.sku_id IS NOT NULL
            THEN documentos_venta.monto - (documentos_venta.cantidad * documentos_venta.costo_unitario)
          ELSE NULL
        END AS margen
      FROM documentos_venta
      JOIN clientes ON clientes.id = documentos_venta.cliente_id
      LEFT JOIN sku ON sku.id = documentos_venta.sku_id
      ORDER BY documentos_venta.id DESC
    `);
    respuesta.writeHead(200, { 'Content-Type': 'application/json' });
    respuesta.end(JSON.stringify(resultado.rows));
    return;
  }

  if (ruta === '/api/ventas' && peticion.method === 'POST') {
    const cuerpo = await leerCuerpoJSON(peticion);
    const venta = await registrarVenta(cuerpo);
    respuesta.writeHead(201, { 'Content-Type': 'application/json' });
    respuesta.end(JSON.stringify(venta));
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