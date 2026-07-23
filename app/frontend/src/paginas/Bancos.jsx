import { useEffect, useState } from 'react';

const API_MOVIMIENTOS = 'http://localhost:3000/api/movimientos-bancarios';
const API_SINCRONIZAR = 'http://localhost:3000/api/sincronizar-fintoc';

const CENTROS_DE_COSTO = ['Sin asignar', 'Providencia', 'Ñuñoa', 'Overhead'];

function Bancos() {
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [sincronizando, setSincronizando] = useState(false);
  const [mensajeSincronizacion, setMensajeSincronizacion] = useState(null);
  const [filtro, setFiltro] = useState('Todos');

  useEffect(() => {
    cargarMovimientos();
  }, []);

  async function cargarMovimientos() {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await fetch(API_MOVIMIENTOS);
      if (!respuesta.ok) throw new Error('El servidor respondió con un error.');
      setMovimientos(await respuesta.json());
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con el servidor (¿está corriendo node server.js en app/backend?).');
    } finally {
      setCargando(false);
    }
  }

  async function sincronizar() {
    setSincronizando(true);
    setMensajeSincronizacion(null);
    setError(null);
    try {
      const respuesta = await fetch(API_SINCRONIZAR, { method: 'POST' });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error || 'Error al sincronizar.');
      setMensajeSincronizacion(`Listo: ${datos.movimientosNuevos} movimiento(s) nuevo(s) desde Fintoc.`);
      await cargarMovimientos();
    } catch (err) {
      console.error(err);
      setError(`No se pudo sincronizar con Fintoc: ${err.message}`);
    } finally {
      setSincronizando(false);
    }
  }

  async function cambiarCentroCosto(id, centroCosto) {
    try {
      await fetch(`http://localhost:3000/api/movimientos/${id}/centro-costo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ centroCosto }),
      });
      await cargarMovimientos();
    } catch (err) {
      console.error(err);
      setError('No se pudo actualizar el centro de costo.');
    }
  }

  const movimientosFiltrados =
    filtro === 'Todos' ? movimientos : movimientos.filter((m) => m.centro_costo === filtro);

  return (
    <div className="pagina">
      <h1>Movimientos bancarios</h1>

      <form className="formulario" onSubmit={(e) => e.preventDefault()}>
        <button type="button" onClick={sincronizar} disabled={sincronizando}>
          {sincronizando ? 'Sincronizando…' : 'Sincronizar con Fintoc'}
        </button>
        <label>
          Filtrar por centro de costo
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option>Todos</option>
            {CENTROS_DE_COSTO.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </form>

      {mensajeSincronizacion && <p>{mensajeSincronizacion}</p>}
      {error && <p className="error">{error}</p>}

      {cargando ? (
        <p>Cargando…</p>
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Glosa</th>
              <th>Monto</th>
              <th>Tipo</th>
              <th>Centro de costo</th>
            </tr>
          </thead>
          <tbody>
            {movimientosFiltrados.map((m) => (
              <tr key={m.id}>
                <td>{m.fecha}</td>
                <td>{m.glosa}</td>
                <td>{Number(m.monto).toLocaleString('es-CL')}</td>
                <td>{m.tipo}</td>
                <td>
                  <select
                    value={m.centro_costo}
                    onChange={(e) => cambiarCentroCosto(m.id, e.target.value)}
                  >
                    {CENTROS_DE_COSTO.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Bancos;
