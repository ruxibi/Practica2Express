const pool = require('../bd-local');

const COLUMNAS_PUBLICAS = 'id, taller_id , boleta, nombre_alumno';

//registrar asistencia
const { randomUUID } = require('crypto');

async function registrarAsistencia(datos) {

    const id = randomUUID();

    await pool.query(
        `INSERT INTO asistencias
        (id, taller_id, nombre_alumno, boleta)
        VALUES (?, ?, ?, ?)`,
        [
            id,
            datos.taller_id,
            datos.nombre_alumno,
            datos.boleta
        ]
    );

    const [filas] = await pool.query(
        `SELECT id,
                taller_id,
                nombre_alumno,
                boleta,
                fecha_registro
         FROM asistencias
         WHERE id = ?`,
        [id]
    );

    return filas[0];
}

module.exports = {
    registrarAsistencia
};
//consultar asistencia de un taller
async function consultarAsistenciaPorTaller(taller_id) {
    const [filas] = await pool.query(`
        SELECT ${COLUMNAS_PUBLICAS} FROM asistencias WHERE taller_id = ?`, [taller_id]);
        return filas;
}   

module.exports = {registrarAsistencia, consultarAsistenciaPorTaller}

