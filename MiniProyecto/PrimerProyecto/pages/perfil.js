import Link from 'next/link';
import { useState } from 'react';
import { pedirJSON } from '../lib/api';
import { formatearFecha } from '../lib/formato';
import { validarBoleta, validarNombre } from '../lib/validaciones';
import estilos from '../styles/Talleres.module.css';

export default function Perfil() {
  const [boleta, setBoleta] = useState('');
  const [buscada, setBuscada] = useState('');
  const [alumno, setAlumno] = useState(null);
  const [nombreInscrito, setNombreInscrito] = useState('');
  const [misTalleres, setMisTalleres] = useState([]);
  const [disponibles, setDisponibles] = useState([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  // Estados para la edición
  const [editando, setEditando] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoCorreo, setNuevoCorreo] = useState('');
  const [nuevaBoleta, setNuevaBoleta] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function buscar(e) {
    e.preventDefault();
    setError('');
    setBuscada('');
    setEditando(false);
    const b = boleta.trim();
    if (!validarBoleta(b)) return setError('La boleta debe tener 10 dígitos.');

    setCargando(true);
    try {
      const usuarios = await pedirJSON('/usuarios');
      const talleres = await pedirJSON('/talleres');
      const listas = await Promise.all(talleres.map((t) => pedirJSON(`/talleres/${t.id}/asistencias`)));
      const conAsistencias = talleres.map((t, i) => ({ ...t, asistencias: listas[i] }));

      const mios = conAsistencias.filter((t) => t.asistencias.some((a) => a.boleta === b));
      const conLugar = conAsistencias.filter(
        (t) => !mios.includes(t) && t.asistencias.length < t.cupo
      );
      const inscripcion = mios.length > 0 ? mios[0].asistencias.find((a) => a.boleta === b) : null;

      const usuarioEncontrado = usuarios.find((u) => u.boleta === b) || null;
      setAlumno(usuarioEncontrado);
      if (usuarioEncontrado) {
        setNuevoNombre(usuarioEncontrado.nombre);
        setNuevoCorreo(usuarioEncontrado.correo);
        setNuevaBoleta(usuarioEncontrado.boleta);
      }

      setNombreInscrito(inscripcion ? inscripcion.nombre_alumno : '');
      setMisTalleres(mios);
      setDisponibles(conLugar);
      setBuscada(b);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function registrarAsistenciaTaller(tallerId) {
    try {
      await pedirJSON('/asistencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taller_id: tallerId,
          boleta: buscada,
        }),
      });
      alert('¡Asistencia registrada con éxito!');
      // Recargamos la información del perfil para actualizar el estado
      buscar({ preventDefault: () => {} });
    } catch (err) {
      alert(err.message || 'Error al registrar la asistencia.');
    }
  }

  async function guardarEdicion(e) {
    e.preventDefault();
    setError('');

    const nombreLimpio = nuevoNombre.trim();
    const correoLimpio = nuevoCorreo.trim();
    const boletaLimpia = nuevaBoleta.trim();

    if (!validarNombre(nombreLimpio)) {
      return setError('Ingresa un nombre válido (solo letras, mínimo 3 caracteres).');
    }
    if (!validarBoleta(boletaLimpia)) {
      return setError('La boleta debe tener exactamente 10 dígitos.');
    }

    setGuardando(true);
    try {
      await pedirJSON(`/usuarios/${alumno.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombreLimpio,
          correo: correoLimpio,
          boleta: boletaLimpia,
          rol: alumno.rol
        }),
      });

      setAlumno({ ...alumno, nombre: nombreLimpio, correo: correoLimpio, boleta: boletaLimpia });
      setBoleta(boletaLimpia);
      setEditando(false);
      alert('¡Perfil actualizado con éxito!');
    } catch (err) {
      setError(err.message || 'Error al actualizar el perfil.');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarCuenta() {
    if (!alumno) return;

    const confirmar = window.confirm(
      `¿Estás seguro de eliminar tu cuenta, ${alumno.nombre}? Esta acción borrará también tus asistencias.`
    );
    if (!confirmar) return;

    setEliminando(true);
    setError('');

    try {
      await pedirJSON(`/usuarios/${alumno.id}`, {
        method: 'DELETE',
      });

      alert('Tu cuenta ha sido eliminada correctamente.');
      setAlumno(null);
      setBuscada('');
      setBoleta('');
      setMisTalleres([]);
      setDisponibles([]);
      setEditando(false);
    } catch (err) {
      setError(err.message || 'Ocurrió un error al intentar eliminar la cuenta.');
    } finally {
      setEliminando(false);
    }
  }

  return (
    <main>
      <h1>Mi perfil</h1>
      <form onSubmit={buscar} className="formulario">
        <input placeholder="Tu boleta (10 dígitos)" value={boleta} onChange={(e) => setBoleta(e.target.value)} />
        <button type="submit" disabled={cargando}>{cargando ? 'Buscando…' : 'Ver mi perfil'}</button>
      </form>
      {error && <p className="error">{error}</p>}

      {buscada && (
        <>
          <section className={estilos.panel}>
            {alumno ? (
              !editando ? (
                <>
                  <h2>{alumno.nombre}</h2>
                  <p><strong>Correo:</strong> {alumno.correo}</p>
                  <p><strong>Boleta:</strong> {alumno.boleta}</p>
                  <p><strong>Rol:</strong> {alumno.rol}</p>
                  
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button 
                      onClick={() => setEditando(true)}
                      style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Editar perfil
                    </button>
                    <button 
                      onClick={eliminarCuenta} 
                      disabled={eliminando}
                      style={{ background: '#b91c1c', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      {eliminando ? 'Eliminando...' : 'Eliminar mi cuenta'}
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={guardarEdicion} className="formulario" style={{ maxWidth: '100%' }}>
                  <h3>Editando Perfil</h3>
                  <div className="form-group" style={{ marginBottom: '10px' }}>
                    <label>Nombre:</label>
                    <input type="text" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '10px' }}>
                    <label>Correo:</label>
                    <input type="email" value={nuevoCorreo} onChange={(e) => setNuevoCorreo(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label>Boleta:</label>
                    <input type="text" value={nuevaBoleta} onChange={(e) => setNuevaBoleta(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" disabled={guardando} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                      {guardando ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                    <button type="button" onClick={() => setEditando(false)} style={{ background: '#6b7280', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                      Cancelar
                    </button>
                  </div>
                </form>
              )
            ) : (
              <>
                <p>
                  La boleta {buscada} no tiene cuenta registrada
                  {nombreInscrito ? ` (inscripciones a nombre de ${nombreInscrito})` : ''}. Aun así puedes
                  inscribirte en un taller.
                </p>
                <Link href="/registroUsuario" style={{color: '#6b1d3a', textDecoration: 'none' }}>
                  Registrarte aquí
                </Link>
              </>
            )}
          </section>

          <h2>Mis talleres ({misTalleres.length})</h2>
          {misTalleres.length === 0 ? (
            <p>Todavía no estás inscrito en ningún taller.</p>
          ) : (
            <ul className={estilos.lista}>
              {misTalleres.map((t) => {
                const registro = t.asistencias.find((a) => a.boleta === buscada);
                const yaAsistio = registro ? registro.asistio : false;

                return (
                  <li key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <Link href={`/talleres/${t.id}`}>{t.nombre}</Link> — {formatearFecha(t.fecha)}
                    </div>
                    <div>
                      {yaAsistio ? (
                        <span style={{ color: 'green', fontWeight: 'bold', marginRight: '10px' }}>Asistencia registrada</span>
                      ) : (
                        <button 
                          onClick={() => registrarAsistenciaTaller(t.id)}
                          style={{ background: '#16a34a', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Registrar asistencia
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <h2>Talleres con lugar disponible</h2>
          {disponibles.length === 0 ? (
            <p>No hay talleres disponibles por ahora.</p>
          ) : (
            <ul className={estilos.lista}>
              {disponibles.map((t) => (
                <li key={t.id}>
                  <Link href={`/talleres/${t.id}`}>{t.nombre}</Link> — {formatearFecha(t.fecha)} ({t.cupo - t.asistencias.length} lugares libres)
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}