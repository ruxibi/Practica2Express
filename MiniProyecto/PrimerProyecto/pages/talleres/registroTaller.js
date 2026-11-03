import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { pedirJSON } from '../../lib/api';
import { validarNombre } from '../../lib/validaciones';
import estilos from '../../styles/Talleres.module.css';

export default function CrearTaller() {
  const [nombre, setNombre] = useState('');
  const [instructor, setInstructor] = useState('');
  const [fecha, setFecha] = useState('');
  const [cupo, setCupo] = useState('');
  
  const [errorForm, setErrorForm] = useState('');
  const [exito, setExito] = useState('');
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  async function crearTaller(e) {
    e.preventDefault();
    setErrorForm('');
    setExito('');

    const nombreLimpio = nombre.trim();
    const instructorLimpio = instructor.trim();
    const cupoNum = parseInt(cupo, 10);

    if (!nombreLimpio || !fecha || !cupo) {
      return setErrorForm('Todos los campos obligatorios deben estar llenos.');
    }

    if (!validarNombre(nombreLimpio)) {
      return setErrorForm('El nombre del taller no es válido (mínimo 3 caracteres y formato correcto).');
    }

    if (instructorLimpio && !validarNombre(instructorLimpio)) {
      return setErrorForm('El nombre del instructor no es válido.');
    }

    const fechaSeleccionada = new Date(fecha);
    const ahora = new Date();

    if (fechaSeleccionada < ahora) {
      return setErrorForm('No puedes programar un taller en una fecha u hora que ya pasó.');
    }

    if (isNaN(cupoNum) || cupoNum < 3) {
      return setErrorForm('Ingresa un cupo válido mayor o igual a 3.');
    }

    setEnviando(true);

    try {
      await pedirJSON('/talleres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombreLimpio,
          instructor: instructorLimpio || 'Por confirmar',
          fecha,
          cupo: cupoNum,
        }),
      });

      setExito('¡Taller creado con éxito! Redirigiendo...');
      
      setTimeout(() => {
        router.push('/talleres');
      }, 1500);

    } catch (err) {
      setErrorForm(err.message || 'Ocurrió un error al registrar el taller.');
    } finally {
      setEnviando(false);
    }
  }
  return (
    <div className="form-container">
      <Link href="/talleres" style={{ display: 'inline-block', marginBottom: '15px' }}>← Volver a talleres</Link>
      <h2>Registrar Nuevo Taller</h2>

      {errorForm && <p className="alert-error">{errorForm}</p>}
      {exito && <p className="alert-exito">{exito}</p>}

      <form onSubmit={crearTaller}>
        <div className="form-group">
          <label>Nombre del taller:</label>   
          <input type="text" placeholder="Ej. Introducción a Python" value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Instructor:</label>
          <input type="text"  placeholder="Ej. Ing. María López" value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Fecha y hora:</label>
          <input type="datetime-local"  value={fecha} onChange={(e) => setFecha(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Cupo máximo:</label>
          <input type="number" placeholder="Ej. 25" value={cupo}
            onChange={(e) => setCupo(e.target.value)}
          />
        </div>

        <button type="submit" disabled={enviando} className="form-button">
          {enviando ? 'Guardando taller...' : 'Crear Taller'}
        </button>
      </form>
    </div>
  );
  
}