import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { pedirJSON } from '../lib/api'; 
import { validarCorreo, validarBoleta } from '../lib/validaciones';

export default function RegistroUsuario() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [boleta, setBoleta] = useState('');
  
  const [errorForm, setErrorForm] = useState('');
  const [exito, setExito] = useState('');
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  async function crearCuenta(e) {
    e.preventDefault();
    setErrorForm('');
    setExito('');

    if (!nombre.trim() || !correo.trim() || !contrasena || !boleta.trim()) {
      return setErrorForm('Todos los campos son obligatorios.');
    }
    if (!validarCorreo(correo.trim())) {
      return setErrorForm('El formato del correo no es válido.');
    }
    if (!validarBoleta(boleta.trim())) {
      return setErrorForm('La boleta debe tener exactamente 10 dígitos.');
    }
    if(!validarNombre(nombre.trim())) {
        return setErrorForm('Ingresa un nombre válido (solo letras, mínimo 3 caracteres).');
    }
    if (contrasena.length < 8) {
      return setErrorForm('La contraseña debe tener al menos 8 caracteres.');
    }

    setEnviando(true);

    try {
      await pedirJSON('/usuarios', {
        method: 'POST',
        body: JSON.stringify({
          nombre: nombre.trim(),
          correo: correo.trim(),
          contrasena,
          boleta: boleta.trim(),
        }),
      });

      setExito('¡Cuenta creada con éxito! Redirigiendo...');
      
      setTimeout(() => {
        router.push('/perfil');
      }, 1500);

    } catch (err) {
      setErrorForm(err.message);
    } finally {
      setEnviando(false);
    }
  }
  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Registro de Usuario</h2>

      {errorForm && <p style={{ color: 'red', background: '#ffe6e6', padding: '10px', borderRadius: '4px' }}>{errorForm}</p>}
      {exito && <p style={{ color: 'green', background: '#e6ffe6', padding: '10px', borderRadius: '4px' }}>{exito}</p>}

      <form onSubmit={crearCuenta}>
        <div style={{ marginBottom: '15px' }}>
          <label>Nombre Completo:</label>   
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Correo Electrónico:</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Boleta (10 dígitos):</label>
          <input
            type="text"
            value={boleta}
            onChange={(e) => setBoleta(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Contraseña (mínimo 8 caracteres):</label>
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={enviando}
          style={{ width: '100%', padding: '10px', background: '#800020', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          {enviando ? 'Registrando...' : 'Crear Cuenta'}
        </button>
      </form>

      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        ¿Ya tienes cuenta? <Link href="/perfil">Ir al perfil</Link>
      </p>
    </div>
  );
}