import Link from 'next/link';
import { useEffect, useState } from 'react';
import { pedirJSON } from '../lib/api';
import { ocultarBoleta } from '../lib/formato';
import { validarBoleta } from '../lib/validaciones';
import estilos from '../styles/Talleres.module.css';

export default function PanelAsistencias() {
    const [asistencias, setAsistencias] = useState([]);
    const [talleres, setTalleres] = useState([]);
 
    // Estados para el formulario de pase de lista / asistencia
    const [tallerSeleccionado, setTallerSeleccionado] = useState('');
    const [boletaAlumno, setBoletaAlumno] = useState('');
    const [errorForm, setErrorForm] = useState('');
    const [exitoForm, setExitoForm] = useState('');
    const [enviando, setEnviando] = useState(false);

    // Estados para filtros y búsqueda
    const [filtroTaller, setFiltroTaller] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [errorCarga, setErrorCarga] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const dataAsistencias = await pedirJSON('/asistencias');
      const dataTalleres = await pedirJSON('/talleres');
      
      setAsistencias(dataAsistencias);
      setTalleres(dataTalleres);
      setErrorCarga('');
    } catch (error) {
      setErrorCarga('Error al cargar la información general de asistencias.');
    }
  }

  async function marcarAsistencia(e) {
    e.preventDefault();
    setErrorForm('');
    setExitoForm('');

    const boletaLimpia = boletaAlumno.trim();

    if (!tallerSeleccionado) {
      return setErrorForm('Selecciona un taller.');
    }
    if (!validarBoleta(boletaLimpia)) {
      return setErrorForm('La boleta debe tener exactamente 10 dígitos.');
    }

    setEnviando(true);
    try {
      await pedirJSON('/asistencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taller_id: tallerSeleccionado,
          boleta: boletaLimpia,
        }),
      });

      setExitoForm('¡Asistencia registrada correctamente!');
      setBoletaAlumno('');
      setTallerSeleccionado('');
      await cargarDatos(); 
    } catch (err) {
      setErrorForm(err.message || 'Ocurrió un error al registrar la asistencia.');
    } finally {
      setEnviando(false);
    }
  }

  // Filtramos para que SOLO aparezcan los que tienen asistio en true
  const asistenciasFiltradas = asistencias.filter((a) => {
    if (!a.asistio) return false; // Si no ha asistido, no se muestra aquí
    const coincideTaller = filtroTaller === '' || String(a.taller_id) === String(filtroTaller);
    const coincideBusqueda = 
      a.nombre_alumno.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.boleta.includes(busqueda);
    return coincideTaller && coincideBusqueda;
  });

  return (
    <main>
      <h1>Control de Asistencias</h1>

      {errorCarga && <p className="error">{errorCarga}</p>}

      {/* Panel de Filtros y Búsqueda */}
      <section className="panel-filtros">
        <div className="filtros-grid">
          <div className="campo-filtro">
            <label>Filtrar por taller:</label>
            <select 
              value={filtroTaller} 
              onChange={(e) => setFiltroTaller(e.target.value)}
            >
              <option value="">Todos los talleres</option>
              {talleres.map((t) => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </div>

          <div className="campo-filtro">
            <label>Buscar por alumno o boleta:</label>
            <input 
              type="text" 
              placeholder="Ej. Juan Pérez o 2023..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Tabla de Registros */}
      <h2>Registros Encontrados ({asistenciasFiltradas.length})</h2>
      
      {asistenciasFiltradas.length === 0 ? (
        <p>No se encontraron registros de asistencia con los filtros seleccionados.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre del Alumno</th>
              <th>Boleta</th>
              <th>Taller</th>
            </tr>
          </thead>
          <tbody>
            {asistenciasFiltradas.map((a, i) => (
              <tr key={a.id || i}>
                <td>{i + 1}</td>
                <td>{a.nombre_alumno}</td>
                <td>{ocultarBoleta(a.boleta)}</td>
                <td>{a.taller_nombre || `Taller ID: ${a.taller_id}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <br /><br />

      {/* Formulario para Pasar Lista / Marcar Asistencia */}
      <div className="form-container" style={{ maxWidth: '600px' }}>
        <h2>Registrar Asistencia (Pase de Lista)</h2>

        {errorForm && <p className="alert-error" style={{ color: 'red' }}>{errorForm}</p>}
        {exitoForm && <p className="alert-exito" style={{ color: 'green' }}>{exitoForm}</p>}

        <form onSubmit={marcarAsistencia}>
          <div className="form-group">
            <label>Seleccionar Taller:</label>
            <select 
              value={tallerSeleccionado} 
              onChange={(e) => setTallerSeleccionado(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">-- Elige un taller --</option>
              {talleres.map((t) => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Boleta del alumno (10 dígitos):</label>
            <input 
              type="text" 
              placeholder="Boleta" 
              value={boletaAlumno}
              onChange={(e) => setBoletaAlumno(e.target.value)}
            />
          </div>

          <button type="submit" disabled={enviando} className="form-button">
            {enviando ? 'Registrando...' : 'Marcar Asistencia'}
          </button>
        </form>
      </div>
    </main>
  );
}