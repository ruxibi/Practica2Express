//vamos a dejarles 2 de las 3 funciones para valdiar 

function validarCorreo(){
//tarea
}

function validarBoleta(boleta) {
    const regex = /^\d{10}$/;
    return regex.test(boleta);
}


function validarContrasena(){
    if (typeof contrasena !== 'string') return false;
    return contrasena.length >= 8;
}

module.exports = {validarBoleta, validarContrasena, validarCorreo}