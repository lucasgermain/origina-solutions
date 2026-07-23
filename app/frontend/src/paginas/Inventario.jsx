import { useEffect, useState } from 'react';

const API_SKUS = 'http://localhost:3000/api/skus';
const API_MOVIMIENTOS = 'http://localhost:3000/api/movimientos-inventario';

function Inventario() {
  const [skus, setSkus] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [codigo, setCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [guardandoSku, setGuardandoSku] = useState(false);

  const [skuId, setSkuId] = useState('');
  const [tipo, setTipo] = useState('entrada');
  const [cantidad, setCantidad] = useState('');
  const [costoUnitario, setCostoUnitario] = useState('');
  const [centroCosto, setCentroCosto] = useState('Providencia');
  const [guardandoMovimiento, setGuardandoMovimiento] = useState(false);

  useEffect(() => {
    cargarSkus();
  }, []);

  async function cargarSkus() {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await fetch(API_SKUS);
      if (!respuesta.ok) throw new Error('El servidor respondió con un error.');
      const datos = await respuesta.json();
      setSkus(datos);
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con el servidor (¿está corriendo node server.js en app/backend?).');
    } finally {
      setCargando(false);
    }
  }

  async function agregarSku(evento) {
    evento.preventDefault();
    setGuardandoSku(true);
    try {
      await fetch(API_SKUS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo, descripcion }),
      });
      setCodigo('');
      setDescripcion('');
      await cargarSkus();
    } catch (err) {
      console.error(err);
      setError('No se pudo guardar el SKU.');
    } finally {
      setGuardandoSku(false);
    }
  }

  async function registrarMovimiento(evento) {
    evento.preventDefault();
    setGuardandoMovimiento(true);
    try {
      await fetch(API_MOVIMIENTOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skuId,
          centroCosto,
          tipo,
          cantidad,
          costoUnitario: tipo === 'entrada' ? costoUnitario : undefined,
        }),
      });
      setCantidad('');
      setCostoUnitario('');
      await cargarSkus();
    } catch (err) {
      console.error(err);
      setError('No se pudo registrar el movimiento.');
    } finally {
      setGuardandoMovimiento(false);
    }
  }

  return (
    <div className="pagina">
      <h1>Inventario</h1>

      <h2>Nuevo SKU</h2>
      <form className="formulario" onSubmit={agregarSku}>
        <label>
          Código
          <input value={codigo} onChange={(e) => setCodigo(e.target.value)} required />
        </label>
        <label>
          Descripción
          <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
        </label>
        <button type="submit" disabled={guardandoSku}>
          {guardandoSku ? 'Guardando…' : 'Crear SKU'}
        </button>
      </form>

      <h2>Registrar movimiento</h2>
      <form className="formulario" onSubmit={registrarMovimiento}>
        <label>
          SKU
          <select value={skuId} onChange={(e) => setSkuId(e.target.value)} required>
            <option value="">-- elegir --</option>
            {skus.map((s) => (
              <option key={s.id} value={s.id}>
                {s.codigo} — {s.descripcion}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tipo
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
            <option value="merma">Merma</option>
          </select>
        </label>
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
        {tipo === 'entrada' && (
          <label>
            Costo unitario
            <input
              type="number"
              step="0.01"
              value={costoUnitario}
              onChange={(e) => setCostoUnitario(e.target.value)}
              required
            />
          </label>
        )}
        <label>
          Centro de costo
          <select value={centroCosto} onChange={(e) => setCentroCosto(e.target.value)}>
            <option>Providencia</option>
            <option>Ñuñoa</option>
          </select>
        </label>
        <button type="submit" disabled={guardandoMovimiento}>
          {guardandoMovimiento ? 'Guardando…' : 'Registrar movimiento'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {cargando ? (
        <p>Cargando…</p>
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>Código</th>
              <th>Descripción</th>
              <th>Stock</th>
              <th>Costo promedio (PMP)</th>
            </tr>
          </thead>
          <tbody>
            {skus.map((s) => (
              <tr key={s.id}>
                <td>{s.codigo}</td>
                <td>{s.descripcion}</td>
                <td>{s.stock}</td>
                <td>{Number(s.costo_promedio).toLocaleString('es-CL')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Inventario;
