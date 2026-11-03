import Link from 'next/link';
import { useState } from 'react';
import { pedirJSON } from '../lib/api';
import { formatearFecha } from '../lib/formato';
import { validarBoleta } from '../lib/validaciones';
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
  const [eliminando, seteliminando] = useState(false);

  async function buscar(e) {
    e.preventDefault();
    setError('');
    setBuscada('');
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

      setAlumno(usuarios.find((u) => u.boleta === b) || null);
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

  async function eliminarCuenta() {
    if (!alumno) return;

    const confirmar = window.confirm(
      `¿Estás seguro de eliminar tu cuenta ${alumno.nombre}?, se eliminaran tambien las asistencias e inscripciones. Esta acción no se puede deshacer.`
    );
    if (!confirmar) return;

    seteliminando(true);
    setError('');

    try {
      
      await pedirJSON(`/usuarios/${alumno.id}`, {
        method: 'DELETE',
      });

      alert('Tu cuenta y sus asistencias han sido eliminadas correctamente.');
      setAlumno(null);
      setBuscada('');
      setBoleta('');
      setMisTalleres([]);
      setDisponibles([]);
    } catch (err) {
      setError(err.message || 'Ocurrió un error al intentar eliminar la cuenta.');
    } finally {
      seteliminando(false);
    }
  }

  const nombre = alumno ? alumno.nombre : nombreInscrito;

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
              <>
                <h2>{alumno.nombre}</h2>
                <p><strong>Correo:</strong> {alumno.correo}</p>
                <p><strong>Boleta:</strong> {alumno.boleta}</p>
                <p><strong>Rol:</strong> {alumno.rol}</p>
                
                {/*BOTÓN DE ELIMINAR CUENTA */}
                <div style={{ marginTop: '20px' }}>
                  <button 
                    onClick={eliminarCuenta} 
                    disabled={eliminando}
                    style={{
                      color: 'Black', 
                      border: 'none', 
                      padding: '8px 12px', 
                      borderRadius: '4px', 
                      cursor: 'pointer'
                    }}
                  >
                    {eliminando ? 'Eliminando cuenta...' : 'Eliminar mi cuenta'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p>
                  La boleta {buscada} no tiene cuenta registrada
                  {nombreInscrito ? ` (inscripciones a nombre de ${nombreInscrito})` : ''}. Aun así puedes
                  inscribirte en un taller. (Regístrate en el sistema para poder gestionar tus datos y talleres)
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
              {misTalleres.map((t) => (
                <li key={t.id}>
                  <Link href={`/talleres/${t.id}`}>{t.nombre}</Link> — {formatearFecha(t.fecha)}
                </li>
              ))}
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