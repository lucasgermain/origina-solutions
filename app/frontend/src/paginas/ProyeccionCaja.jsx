import { useEffect, useState } from 'react';

const API_PROYECCION = 'http://localhost:3000/api/proyeccion-caja';

function ProyeccionCaja() {
  const [dias, setDias] = useState(90);
  const [proyeccion, setProyeccion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargarProyeccion() {
      setCargando(true);
      setError(null);
      try {
        const respuesta = await fetch(`${API_PROYECCION}?dias=${dias}`);
        if (!respuesta.ok) throw new Error('El servidor respondió con un error.');
        setProyeccion(await respuesta.json());
      } catch (err) {
        console.error(err);
        setError('No se pudo conectar con el servidor (¿está corriendo node server.js en app/backend?).');
      } finally {
        setCargando(false);
      }
    }

    cargarProyeccion();
  }, [dias]);

  return (
    <div className="pagina">
      <h1>Proyección de caja</h1>

      <form className="formulario" onSubmit={(e) => e.preventDefault()}>
        <label>
          Horizonte
          <select value={dias} onChange={(e) => setDias(Number(e.target.value))}>
            <option value={60}>60 días</option>
            <option value={90}>90 días</option>
          </select>
        </label>
      </form>

      {error && <p className="error">{error}</p>}

      {cargando || !proyeccion ? (
        <p>Cargando…</p>
      ) : (
        <>
          <p>
            Saldo bancario actual: <strong>{proyeccion.saldoActual.toLocaleString('es-CL')}</strong>
          </p>

          {proyeccion.alerta ? (
            <p className="error">
              ⚠ Alerta: el saldo proyectado se pone negativo el {proyeccion.alerta.fecha} (
              {proyeccion.alerta.saldoProyectado.toLocaleString('es-CL')}). Vas a necesitar financiamiento
              antes de esa fecha si nada cambia.
            </p>
          ) : (
            <p>Sin alertas: el saldo proyectado no se pone negativo en los próximos {dias} días.</p>
          )}

          {proyeccion.eventos.length === 0 ? (
            <p>No hay movimientos futuros conocidos (facturas por cobrar, cuotas o sueldos pendientes) en este horizonte.</p>
          ) : (
            <table className="tabla">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Concepto</th>
                  <th>Monto</th>
                  <th>Saldo proyectado</th>
                </tr>
              </thead>
              <tbody>
                {proyeccion.eventos.map((evento, indice) => (
                  <tr key={indice} style={evento.saldoProyectado < 0 ? { color: '#b91c1c' } : undefined}>
                    <td>{evento.fecha}</td>
                    <td>{evento.concepto}</td>
                    <td>{evento.monto.toLocaleString('es-CL')}</td>
                    <td>{evento.saldoProyectado.toLocaleString('es-CL')}</td>
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

export default ProyeccionCaja;
