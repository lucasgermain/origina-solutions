import { useState } from 'react';
import './App.css';
import Clientes from './paginas/Clientes';
import Inventario from './paginas/Inventario';
import Ventas from './paginas/Ventas';

const PANTALLAS = {
  clientes: Clientes,
  ventas: Ventas,
  inventario: Inventario,
};

function App() {
  const [pantalla, setPantalla] = useState('clientes');
  const Pantalla = PANTALLAS[pantalla];

  return (
    <div>
      <nav className="nav">
        <button
          className={pantalla === 'clientes' ? 'activo' : ''}
          onClick={() => setPantalla('clientes')}
        >
          Clientes
        </button>
        <button
          className={pantalla === 'ventas' ? 'activo' : ''}
          onClick={() => setPantalla('ventas')}
        >
          Ventas
        </button>
        <button
          className={pantalla === 'inventario' ? 'activo' : ''}
          onClick={() => setPantalla('inventario')}
        >
          Inventario
        </button>
      </nav>

      <Pantalla />
    </div>
  );
}

export default App;
