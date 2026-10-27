import { useEffect, useState } from 'react';
import { pedirJSON } from '../../lib/api';

import TarjetaTaller from '../../components/TarjetaTaller';
import estilos from '../../styles/Talleres.module.css';


// /talleres — lista de talleres (GET /api/talleres).
// PASO 2: lista sencilla con estados de carga y error.
// PASO 3: cambia la lista por tarjetas (components/TarjetaTaller.js) en una rejilla.
// PASO 7: agrega el buscador.
export default function Talleres() {
  const [talleres, setTalleres] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // TODO paso 2: useEffect que llame a cargarTalleres() una sola vez, al abrir la página.

  useEffect(() => {
    cargarTalleres();
  }, []);

  
  async function cargarTalleres() {
    try {
      setTalleres(await pedirJSON('/talleres'));
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <main>
      <h1>Talleres</h1>
      { cargando && <p>Cargando talleres…</p>}
      {error && <p className="error">{error}</p>}

      {!cargando && !error && talleres.length === 0 && (
        <p>No hay talleres registrados.</p>
      )}
      <div className={estilos.rejilla}>
        {talleres.map((t) => (
          <TarjetaTaller key={t.id} taller={t} />
        ))}
      </div>


    </main>
  );
}
