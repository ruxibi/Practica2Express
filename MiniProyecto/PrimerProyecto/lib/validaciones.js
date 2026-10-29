export function validarBoleta(boleta) {
    // Expresión regular que verifica que la cadena tenga exactamente 10 dígitos numéricos
    const regex = /^\d{10}$/;
    return regex.test(boleta);
}