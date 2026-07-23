import { useEffect, useState } from 'react';

const API_VENTAS = 'http://localhost:3000/api/ventas';
const API_CLIENTES = 'http://localhost:3000/api/clientes';
const API_SKUS = 'http://localhost:3000/api/skus';

function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [skus, setSkus] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [clienteId, setClienteId] = useState('');
  const [tipoDte, setTipoDte] = useState('boleta');
  const [monto, setMonto] = useState('');
  const [centroCosto, setCentroCosto] = useState('Providencia');
  const [skuId, setSkuId] = useState('');
  const [cantidad, setCantidad] = useState('');

  useEffect(() => {
    cargarTodo();
  }, []);

  async function cargarTodo() {
    setCargando(true);
    setError(null);
    try {
      const [ventasResp, clientesResp, skusResp] = await Promise.all([
        fetch(API_VENTAS),
        fetch(API_CLIENTES),
        fetch(API_SKUS),
      ]);
      if (!ventasResp.ok || !clientesResp.ok || !skusResp.ok) {
        throw new Error('El servidor respondió con un error.');
      }
      setVentas(await ventasResp.json());
      setClientes(await clientesResp.json());
      setSkus(await skusResp.json());
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con el servidor (¿está corriendo node server.js en app/backend?).');
    } finally {
      setCargando(false);
    }
  }

  async function registrarVenta(evento) {
    evento.preventDefault();
    setGuardando(true);
    try {
      await fetch(API_VENTAS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId,
          centroCosto,
          tipoDte,
          monto,
          skuId: skuId || undefined,
          cantidad: skuId ? cantidad : undefined,
        }),
      });
      setMonto('');
      setCantidad('');
      await cargarTodo();
    } catch (err) {
      console.error(err);
      setError('No se pudo registrar la venta.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="pagina">
      <h1>Documentos de venta</h1>

      <form className="formulario" onSubmit={registrarVenta}>
        <label>
          Cliente
          <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} required>
            <option value="">-- elegir --</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tipo
          <select value={tipoDte} onChange={(e) => setTipoDte(e.target.value)}>
            <option value="boleta">Boleta</option>
            <option value="factura">Factura</option>
          </select>
        </label>
        <label>
          SKU vendido (opcional)
          <select value={skuId} onChange={(e) => setSkuId(e.target.value)}>
            <option value="">-- sin SKU --</option>
            {skus.map((s) => (
              <option key={s.id} value={s.id}>
                {s.codigo} — {s.descripcion} (stock: {s.stock})
              </option>
            ))}
          </select>
        </label>
        {skuId && (
          <label>
            Cantidad
            <input
              type="number"
              step="0.01"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
            />
          </label>
        )}
        <label>
          Monto
          <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} required />
        </label>
        <label>
          Centro de costo
          <select value={centroCosto} onChange={(e) => setCentroCosto(e.target.value)}>
            <option>Providencia</option>
            <option>Ñuñoa</option>
          </select>
        </label>
        <button type="submit" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Registrar venta'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {cargando ? (
        <p>Cargando…</p>
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Monto</th>
              <th>SKU</th>
              <th>Cantidad</th>
              <th>Margen</th>
              <th>Centro de costo</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((v) => (
              <tr key={v.id}>
                <td>{v.cliente_nombre}</td>
                <td>{v.tipo_dte}</td>
                <td>{v.monto}</td>
                <td>{v.sku_codigo || '—'}</td>
                <td>{v.cantidad ?? '—'}</td>
                <td>{v.margen !== null ? Number(v.margen).toLocaleString('es-CL') : '—'}</td>
                <td>{v.centro_costo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Ventas;
