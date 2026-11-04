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

  // Filtramos para que SOLO aparezcan los que tienen asistio en true en la tabla
  const asistenciasFiltradas = asistencias.filter((a) => {
    if (!a.asistio) return false; // Si no ha asistido, no se muestra en la tabla de confirmados
    const coincideTaller = filtroTaller === '' || String(a.taller_id) === String(filtroTaller);
    const coincideBusqueda =
      a.nombre_alumno.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.boleta.includes(busqueda);
    return coincideTaller && coincideBusqueda;
  });

  // Talleres filtrados para las tarjetas de resumen (si hay un filtro seleccionado, muestra solo ese taller)
  const talleresMostrados = talleres.filter((t) => 
    filtroTaller === '' || String(t.id) === String(filtroTaller)
  );

  return (
    <main>
      <h1>Asistencias Generales</h1>
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

      {/* Resumen de Asistencias por Taller */}
      <section style={{ marginTop: '20px', marginBottom: '20px' }}>
        <h2>Resumen por Taller</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
          {talleresMostrados.map((taller) => {
            // Obtenemos todos los registros de la tabla asistencias que pertenecen a este taller
            const registrosTaller = asistencias.filter(a => String(a.taller_id) === String(taller.id));
            const totalInscritos = registrosTaller.length;
            const totalAsistidos = registrosTaller.filter(a => a.asistio === 1 || a.asistio === true).length;

            return (
              <div key={taller.id} className="taller-resumen-card" style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '6px', background: '#f9f9f9' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>{taller.nombre}</h4>
                <p style={{ margin: '5px 0' }}><strong>Inscritos:</strong> {totalInscritos} / {taller.cupo}</p>
                <p style={{ margin: '5px 0' }}><strong>Asistencias confirmadas:</strong> {totalAsistidos}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tabla de Registros Confirmados */}
      <h2>Registros de Asistencia Confirmada ({asistenciasFiltradas.length})</h2>

      {asistenciasFiltradas.length === 0 ? (
        <p>No se encontraron registros de asistencia confirmada con los filtros seleccionados.</p>
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
            {asistenciasFiltradas.map((a, i) => {
              const tallerObj = talleres.find(t => String(t.id) === String(a.taller_id));
              return (
                <tr key={a.id || i}>
                  <td>{i + 1}</td>
                  <td>{a.nombre_alumno}</td>
                  <td>{ocultarBoleta(a.boleta)}</td>
                  <td>{tallerObj ? tallerObj.nombre : `Taller ID: ${a.taller_id}`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}