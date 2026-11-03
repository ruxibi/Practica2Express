import Link from 'next/link';
import { useEffect, useState } from 'react';
import { pedirJSON } from '../lib/api';
import { ocultarBoleta } from '../lib/formato';
import { validarBoleta, validarNombre } from '../lib/validaciones';
import estilos from '../styles/Talleres.module.css';

export default function PanelAsistencias() {
    const [asistencias, setAsistencias] = useState([]);
    const [talleres, setTalleres] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
 
    // Estados para el formulario de registro directo
    const [tallerSeleccionado, setTallerSeleccionado] = useState('');
    const [nombreAlumno, setNombreAlumno] = useState('');
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
      // Usamos /asistencias porque pedirJSON ya añade /api automáticamente
      const dataAsistencias = await pedirJSON('/asistencias');
      const dataTalleres = await pedirJSON('/talleres');
      const usuariosData = await pedirJSON('/usuarios'); 
      
      setUsuarios(usuariosData);
      setAsistencias(dataAsistencias);
      setTalleres(dataTalleres);
      setErrorCarga('');
    } catch (error) {
      setErrorCarga('Error al cargar la información general de asistencias.');
    }
  }

  async function registrarAsistenciaDirecta(e) {
    e.preventDefault();
    setErrorForm('');
    setExitoForm('');

    const nombreLimpio = nombreAlumno.trim();
    const boletaLimpia = boletaAlumno.trim();

    if (!tallerSeleccionado) {
      return setErrorForm('Selecciona un taller para la inscripción.');
    }
    if (!validarNombre(nombreLimpio)) {
      return setErrorForm('Ingresa un nombre válido (solo letras, mínimo 3 caracteres).');
    }
    if (!validarBoleta(boletaLimpia)) {
      return setErrorForm('La boleta debe tener exactamente 10 dígitos.');
    }

    // Validación de usuario registrado vs nombre
    const usuarioEncontrado = usuarios.find((u) => u.boleta === boletaLimpia);
    if (usuarioEncontrado) {
      if (usuarioEncontrado.nombre.trim().toLowerCase() !== nombreLimpio.toLowerCase()) {
        return setErrorForm('La boleta pertenece a un usuario registrado, pero el nombre no coincide.');
      }
    }

    // Validar si ya está inscrito en ese taller
    const yaInscrito = asistencias.some(
      (a) => String(a.taller_id) === String(tallerSeleccionado) && a.boleta === boletaLimpia
    );
    if (yaInscrito) {
      return setErrorForm('Esta boleta ya se encuentra inscrita en este taller.');
    }

    // Validar cupo y fecha del taller seleccionado
    const tallerObj = talleres.find((t) => String(t.id) === String(tallerSeleccionado));
    if (tallerObj) {
      const ocupadosTaller = asistencias.filter((a) => String(a.taller_id) === String(tallerSeleccionado)).length;
      const libresTaller = Math.max(0, tallerObj.cupo - ocupadosTaller);
      
      if (libresTaller === 0) {
        return setErrorForm('El taller ya alcanzó su cupo máximo.');
      }

      const hoyStr = new Date().toISOString().split('T')[0];
      const fechaTallerStr = tallerObj.fecha.split('T')[0];

      if (fechaTallerStr < hoyStr) {
        return setErrorForm('No es posible inscribirse a un taller de una fecha que ya pasó.');
      }
    }

    setEnviando(true);
    try {
      await pedirJSON('/asistencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taller_id: tallerSeleccionado,
          nombre_alumno: nombreLimpio,
          boleta: boletaLimpia,
        }),
      });

      setExitoForm('¡Inscripción registrada con éxito!');
      setNombreAlumno('');
      setBoletaAlumno('');
      setTallerSeleccionado('');
      await cargarDatos(); 
    } catch (err) {
      setErrorForm(err.message || 'Ocurrió un error al registrar.');
    } finally {
      setEnviando(false);
    }
  }

  const asistenciasFiltradas = asistencias.filter((a) => {
    const coincideTaller = filtroTaller === '' || String(a.taller_id) === String(filtroTaller);
    const coincideBusqueda = 
      a.nombre_alumno.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.boleta.includes(busqueda);
    return coincideTaller && coincideBusqueda;
  });

  return (
    <main>
      <h1>Asistencias Generales</h1>

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

      {/* Formulario de Nueva Inscripción Directa */}
      <div className="form-container" style={{ maxWidth: '600px' }}>
        <h2>Registrar Asistencia</h2>

        {errorForm && <p className="alert-error">{errorForm}</p>}
        {exitoForm && <p className="alert-exito">{exitoForm}</p>}

        <form onSubmit={registrarAsistenciaDirecta}>
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
            <label>Nombre del alumno:</label>
            <input 
              type="text" 
              placeholder="Nombre completo" 
              value={nombreAlumno}
              onChange={(e) => setNombreAlumno(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Boleta (10 dígitos):</label>
            <input 
              type="text" 
              placeholder="Boleta" 
              value= {boletaAlumno}
              onChange={(e) => setBoletaAlumno(e.target.value)}
            />
          </div>

          <button type="submit" disabled={enviando} className="form-button">
            {enviando ? 'Registrando...' : 'Registrar'}
          </button>
        </form>
      </div>
    </main>
  );
}