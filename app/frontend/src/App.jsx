import { useState } from 'react';
import './App.css';
import Bancos from './paginas/Bancos';
import Clientes from './paginas/Clientes';
import Inventario from './paginas/Inventario';
import Ventas from './paginas/Ventas';
import Remuneraciones from './paginas/Remuneraciones';
import Deuda from './paginas/Deuda';
import ProyeccionCaja from './paginas/ProyeccionCaja';

const PANTALLAS = [
  { clave: 'bancos', etiqueta: 'Bancos', componente: Bancos },
  { clave: 'clientes', etiqueta: 'Clientes', componente: Clientes },
  { clave: 'ventas', etiqueta: 'Ventas', componente: Ventas },
  { clave: 'inventario', etiqueta: 'Inventario', componente: Inventario },
  { clave: 'remuneraciones', etiqueta: 'Remuneraciones', componente: Remuneraciones },
  { clave: 'deuda', etiqueta: 'Deuda', componente: Deuda },
  { clave: 'proyeccion', etiqueta: 'Proyección de caja', componente: ProyeccionCaja },
];

function App() {
  const [pantalla, setPantalla] = useState('clientes');
  const activa = PANTALLAS.find((p) => p.clave === pantalla);
  const Pantalla = activa.componente;

  return (
    <div>
      <nav className="nav">
        {PANTALLAS.map((p) => (
          <button
            key={p.clave}
            className={pantalla === p.clave ? 'activo' : ''}
            onClick={() => setPantalla(p.clave)}
          >
            {p.etiqueta}
          </button>
        ))}
      </nav>

      <Pantalla />
    </div>
  );
}

export default App;
