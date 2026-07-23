import { useEffect, useState } from 'react';

const API_EMPLEADOS = 'http://localhost:3000/api/empleados';
const API_LIQUIDACIONES = 'http://localhost:3000/api/liquidaciones';

function Remuneraciones() {
  const [empleados, setEmpleados] = useState([]);
  const [liquidaciones, setLiquidaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [rut, setRut] = useState('');
  const [nombre, setNombre] = useState('');
  const [cargo, setCargo] = useState('');
  const [centroCosto, setCentroCosto] = useState('Providencia');
  const [guardandoEmpleado, setGuardandoEmpleado] = useState(false);

  const [empleadoId, setEmpleadoId] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [sueldoLiquido, setSueldoLiquido] = useState('');
  const [sueldoImponible, setSueldoImponible] = useState('');
  const [cotizaciones, setCotizaciones] = useState('');
  const [guardandoLiquidacion, setGuardandoLiquidacion] = useState(false);

  useEffect(() => {
    cargarTodo();
  }, []);

  async function cargarTodo() {
    setCargando(true);
    setError(null);
    try {
      const [empleadosResp, liquidacionesResp] = await Promise.all([
        fetch(API_EMPLEADOS),
        fetch(API_LIQUIDACIONES),
      ]);
      if (!empleadosResp.ok || !liquidacionesResp.ok) {
        throw new Error('El servidor respondió con un error.');
      }
      setEmpleados(await empleadosResp.json());
      setLiquidaciones(await liquidacionesResp.json());
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con el servidor (¿está corriendo node server.js en app/backend?).');
    } finally {
      setCargando(false);
    }
  }

  async function agregarEmpleado(evento) {
    evento.preventDefault();
    setGuardandoEmpleado(true);
    try {
      await fetch(API_EMPLEADOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut, nombre, cargo, centroCosto }),
      });
      setRut('');
      setNombre('');
      setCargo('');
      await cargarTodo();
    } catch (err) {
      console.error(err);
      setError('No se pudo guardar el empleado.');
    } finally {
      setGuardandoEmpleado(false);
    }
  }

  async function registrarLiquidacion(evento) {
    evento.preventDefault();
    setGuardandoLiquidacion(true);
    try {
      await fetch(API_LIQUIDACIONES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empleadoId,
          periodo,
          sueldoLiquido,
          sueldoImponible,
          cotizaciones,
        }),
      });
      setPeriodo('');
      setSueldoLiquido('');
      setSueldoImponible('');
      setCotizaciones('');
      await cargarTodo();
    } catch (err) {
      console.error(err);
      setError('No se pudo registrar la liquidación.');
    } finally {
      setGuardandoLiquidacion(false);
    }
  }

  async function marcarComoPagada(id) {
    try {
      await fetch(`${API_LIQUIDACIONES}/${id}/pagar`, { method: 'POST' });
      await cargarTodo();
    } catch (err) {
      console.error(err);
      setError('No se pudo marcar la liquidación como pagada.');
    }
  }

  return (
    <div className="pagina">
      <h1>Remuneraciones</h1>

      <h2>Nuevo empleado</h2>
      <form className="formulario" onSubmit={agregarEmpleado}>
        <label>
          RUT
          <input value={rut} onChange={(e) => setRut(e.target.value)} required />
        </label>
        <label>
          Nombre
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </label>
        <label>
          Cargo
          <input value={cargo} onChange={(e) => setCargo(e.target.value)} required />
        </label>
        <label>
          Centro de costo
          <select value={centroCosto} onChange={(e) => setCentroCosto(e.target.value)}>
            <option>Providencia</option>
            <option>Ñuñoa</option>
          </select>
        </label>
        <button type="submit" disabled={guardandoEmpleado}>
          {guardandoEmpleado ? 'Guardando…' : 'Crear empleado'}
        </button>
      </form>

      <h2>Registrar liquidación</h2>
      <form className="formulario" onSubmit={registrarLiquidacion}>
        <label>
          Empleado
          <select value={empleadoId} onChange={(e) => setEmpleadoId(e.target.value)} required>
            <option value="">-- elegir --</option>
            {empleados.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre} — {e.cargo}
              </option>
            ))}
          </select>
        </label>
        <label>
          Periodo (AAAA-MM)
          <input
            placeholder="2026-07"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            required
          />
        </label>
        <label>
          Sueldo líquido
          <input
            type="number"
            value={sueldoLiquido}
            onChange={(e) => setSueldoLiquido(e.target.value)}
            required
          />
        </label>
        <label>
          Sueldo imponible
          <input
            type="number"
            value={sueldoImponible}
            onChange={(e) => setSueldoImponible(e.target.value)}
            required
          />
        </label>
        <label>
          Cotizaciones
          <input
            type="number"
            value={cotizaciones}
            onChange={(e) => setCotizaciones(e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={guardandoLiquidacion}>
          {guardandoLiquidacion ? 'Guardando…' : 'Registrar liquidación'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {cargando ? (
        <p>Cargando…</p>
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Centro de costo</th>
              <th>Periodo</th>
              <th>Sueldo líquido</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {liquidaciones.map((l) => (
              <tr key={l.id}>
                <td>{l.empleado_nombre}</td>
                <td>{l.centro_costo}</td>
                <td>{l.periodo}</td>
                <td>{Number(l.sueldo_liquido).toLocaleString('es-CL')}</td>
                <td>{l.estado_pago}</td>
                <td>
                  {l.estado_pago === 'pendiente' && (
                    <button type="button" onClick={() => marcarComoPagada(l.id)}>
                      Marcar pagada
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Remuneraciones;
