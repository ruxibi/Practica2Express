
export function validarBoleta(boleta) {
  const regex = /^\d{10}$/;
  return regex.test(boleta);
}

export function validarNombre(nombre) {
  // Acepta letras con acentos, eñes y espacios, con un mínimo de 3 caracteres
  const regex = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]{3,}$/;
  return regex.test(nombre.trim());
}

export function validarCorreo(correo) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(correo.trim());
}