import { useState } from 'react';
import './App.css';
import Clientes from './paginas/Clientes';
import Inventario from './paginas/Inventario';

function App() {
  const [pantalla, setPantalla] = useState('clientes');

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
          className={pantalla === 'inventario' ? 'activo' : ''}
          onClick={() => setPantalla('inventario')}
        >
          Inventario
        </button>
      </nav>

      {pantalla === 'clientes' ? <Clientes /> : <Inventario />}
    </div>
  );
}

export default App;
