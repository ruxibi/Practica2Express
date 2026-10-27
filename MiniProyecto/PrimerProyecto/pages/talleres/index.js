import { useEffect, useState } from 'react';
import { pedirJSON } from '../../lib/api';

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

      <ul>
        {talleres.map((t) => (
          <li key={t.id}>
            {t.nombre} — {t.fecha} — cupo {t.cupo}
          </li>
        ))}
      </ul>

    </main>
  );
}
