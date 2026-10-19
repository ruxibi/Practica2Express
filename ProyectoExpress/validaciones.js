//vamos a dejarles 2 de las 3 funciones para valdiar 

function validarCorreo(){
//tarea
}

function validarBoleta(){
//tarea
}

function validarContrasena(){
    if (typeof contrasena !== 'string') return false;
    return contrasena.length >= 8;
}

module.exports = {validarBoleta, validarContrasena, validarCorreo}