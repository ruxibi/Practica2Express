const pool = require('../bd-local');

const COLUMNAS_PUBLICAS = 'id, id_taller, id_alumno, boleta, nombre_alumnoa';

//registrar asistencia
async function registrarAsistencia({id_taller, id_alumno, boleta, nombre_alumnoa}) {
    const [info] = await pool.query(
        `INSERT INTO asistencia (id_taller, id_alumno, boleta, nombre_alumnoa) VALUES (?, ?, ?, ?)`, [id_taller, id_alumno, boleta, nombre_alumnoa]
    );
    return info.insertId;
}       

//consultar asistencia de un taller
async function consultarAsistenciaPorTaller(id_taller) {
    const [filas] = await pool.query(`
        SELECT ${COLUMNAS_PUBLICAS} FROM asistencia WHERE id_taller = ?`, [id_taller]);
        return filas;
}   

module.exports = {registrarAsistencia, consultarAsistenciaPorTaller}

