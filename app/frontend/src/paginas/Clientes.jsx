import { useEffect, useState } from 'react';

const API_CLIENTES = 'http://localhost:3000/api/clientes';

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [rut, setRut] = useState('');
  const [nombre, setNombre] = useState('');
  const [centroCosto, setCentroCosto] = useState('Providencia');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarClientes();
  }, []);

  async function cargarClientes() {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await fetch(API_CLIENTES);
      if (!respuesta.ok) throw new Error('El servidor respondió con un error.');
      const datos = await respuesta.json();
      setClientes(datos);
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con el servidor (¿está corriendo node server.js en app/backend?).');
    } finally {
      setCargando(false);
    }
  }

  async function agregarCliente(evento) {
    evento.preventDefault();
    setGuardando(true);
    try {
      await fetch(API_CLIENTES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut, nombre, centroCosto }),
      });
      setRut('');
      setNombre('');
      await cargarClientes();
    } catch (err) {
      console.error(err);
      setError('No se pudo guardar el cliente.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="pagina">
      <h1>Clientes</h1>

      <form className="formulario" onSubmit={agregarCliente}>
        <label>
          RUT
          <input value={rut} onChange={(e) => setRut(e.target.value)} required />
        </label>
        <label>
          Nombre
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </label>
        <label>
          Centro de costo
          <select value={centroCosto} onChange={(e) => setCentroCosto(e.target.value)}>
            <option>Providencia</option>
            <option>Ñuñoa</option>
          </select>
        </label>
        <button type="submit" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Agregar cliente'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {cargando ? (
        <p>Cargando…</p>
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>RUT</th>
              <th>Nombre</th>
              <th>Centro de costo</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id}>
                <td>{c.rut}</td>
                <td>{c.nombre}</td>
                <td>{c.centro_costo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Clientes;
