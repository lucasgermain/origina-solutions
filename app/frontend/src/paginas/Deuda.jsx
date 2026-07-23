import { useEffect, useState } from 'react';

const API_DEUDAS = 'http://localhost:3000/api/deudas';

function Deuda() {
  const [deudas, setDeudas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [tipo, setTipo] = useState('credito_comercial');
  const [acreedor, setAcreedor] = useState('');
  const [montoOriginal, setMontoOriginal] = useState('');
  const [tasaInteres, setTasaInteres] = useState('');
  const [plazoMeses, setPlazoMeses] = useState('');
  const [centroCosto, setCentroCosto] = useState('');

  const [deudaSeleccionada, setDeudaSeleccionada] = useState(null);
  const [cuotas, setCuotas] = useState([]);
  const [cargandoCuotas, setCargandoCuotas] = useState(false);

  useEffect(() => {
    cargarDeudas();
  }, []);

  async function cargarDeudas() {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await fetch(API_DEUDAS);
      if (!respuesta.ok) throw new Error('El servidor respondió con un error.');
      setDeudas(await respuesta.json());
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con el servidor (¿está corriendo node server.js en app/backend?).');
    } finally {
      setCargando(false);
    }
  }

  async function agregarDeuda(evento) {
    evento.preventDefault();
    setGuardando(true);
    try {
      await fetch(API_DEUDAS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo,
          acreedor,
          montoOriginal,
          tasaInteres,
          plazoMeses,
          centroCosto: centroCosto || undefined,
        }),
      });
      setAcreedor('');
      setMontoOriginal('');
      setTasaInteres('');
      setPlazoMeses('');
      await cargarDeudas();
    } catch (err) {
      console.error(err);
      setError('No se pudo guardar la deuda.');
    } finally {
      setGuardando(false);
    }
  }

  async function verCuotas(deuda) {
    setDeudaSeleccionada(deuda);
    setCargandoCuotas(true);
    try {
      const respuesta = await fetch(`${API_DEUDAS}/${deuda.id}/cuotas`);
      setCuotas(await respuesta.json());
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar la tabla de amortización.');
    } finally {
      setCargandoCuotas(false);
    }
  }

  async function marcarCuotaPagada(id) {
    try {
      await fetch(`http://localhost:3000/api/cuotas/${id}/pagar`, { method: 'POST' });
      await verCuotas(deudaSeleccionada);
      await cargarDeudas();
    } catch (err) {
      console.error(err);
      setError('No se pudo marcar la cuota como pagada.');
    }
  }

  return (
    <div className="pagina">
      <h1>Deuda y leasing</h1>

      <form className="formulario" onSubmit={agregarDeuda}>
        <label>
          Tipo
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="credito_comercial">Crédito comercial</option>
            <option value="linea_credito">Línea de crédito</option>
            <option value="leasing_financiero">Leasing financiero</option>
            <option value="leasing_operativo">Leasing operativo</option>
            <option value="factoring">Factoring</option>
          </select>
        </label>
        <label>
          Acreedor
          <input value={acreedor} onChange={(e) => setAcreedor(e.target.value)} required />
        </label>
        <label>
          Monto original
          <input
            type="number"
            value={montoOriginal}
            onChange={(e) => setMontoOriginal(e.target.value)}
            required
          />
        </label>
        <label>
          Tasa mensual (ej. 0.015)
          <input
            type="number"
            step="0.0001"
            value={tasaInteres}
            onChange={(e) => setTasaInteres(e.target.value)}
            required
          />
        </label>
        <label>
          Plazo (meses)
          <input
            type="number"
            value={plazoMeses}
            onChange={(e) => setPlazoMeses(e.target.value)}
            required
          />
        </label>
        <label>
          Centro de costo (opcional)
          <select value={centroCosto} onChange={(e) => setCentroCosto(e.target.value)}>
            <option value="">-- toda la empresa --</option>
            <option>Providencia</option>
            <option>Ñuñoa</option>
          </select>
        </label>
        <button type="submit" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Registrar deuda'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {cargando ? (
        <p>Cargando…</p>
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>Acreedor</th>
              <th>Tipo</th>
              <th>Monto original</th>
              <th>Saldo pendiente</th>
              <th>Próxima cuota</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {deudas.map((d) => (
              <tr key={d.id}>
                <td>{d.acreedor}</td>
                <td>{d.tipo}</td>
                <td>{Number(d.monto_original).toLocaleString('es-CL')}</td>
                <td>{Number(d.saldo_pendiente).toLocaleString('es-CL')}</td>
                <td>{d.proxima_cuota || '—'}</td>
                <td>
                  <button type="button" onClick={() => verCuotas(d)}>
                    Ver cuotas
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {deudaSeleccionada && (
        <>
          <h2>Tabla de amortización — {deudaSeleccionada.acreedor}</h2>
          {cargandoCuotas ? (
            <p>Cargando…</p>
          ) : (
            <table className="tabla">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Vencimiento</th>
                  <th>Capital</th>
                  <th>Interés</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cuotas.map((c) => (
                  <tr key={c.id}>
                    <td>{c.numero_cuota}</td>
                    <td>{c.fecha_vencimiento}</td>
                    <td>{Number(c.capital).toLocaleString('es-CL')}</td>
                    <td>{Number(c.interes).toLocaleString('es-CL')}</td>
                    <td>{c.estado_mostrado}</td>
                    <td>
                      {c.estado_pago === 'pendiente' && (
                        <button type="button" onClick={() => marcarCuotaPagada(c.id)}>
                          Marcar pagada
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

export default Deuda;
