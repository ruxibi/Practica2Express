//vamos a dejarles 2 de las 3 funciones para valdiar 

function validarCorreo(correo) {
    if (typeof correo !== 'string') return false;
    
    // Expresión regular para validar el formato de un correo electrónico
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    return regexCorreo.test(correo);
}

function validarBoleta(){
//tarea
}

function validarContrasena(){
    if (typeof contrasena !== 'string') return false;
    return contrasena.length >= 8;
}

module.exports = {validarBoleta, validarContrasena, validarCorreo}