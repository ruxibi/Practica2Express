const pool  = require ('../bd-local');

const COLUMNAS_PUBLICAS = 'id, nombre, instructor, fecha, cupo';

// Registrar alumno al taller
async function registrarAlumno({ taller_id, nombre_alumno, boleta }) {
    const [info] = await pool.query(
        `INSERT INTO asistencias (taller_id, nombre_alumno, boleta)
         VALUES (?, ?, ?)`,
        [taller_id, nombre_alumno, boleta]
    );

    return info.affectedRows > 0;
}

// Listar talleres
async function listarTalleres() {
    const [filas] = await pool.query(
        'SELECT id,nombre,instructor,fecha,cupo FROM talleres'
    );

    return filas;
}

// Obtener taller por ID
async function obtenerPorId(id) {
    const [filas] = await pool.query(
        `SELECT ${COLUMNAS_PUBLICAS}
         FROM talleres
         WHERE id = ?`,
        [id]
    );

    return filas[0];
}

// Crear taller
async function crearTaller(nombre, instructor, fecha, cupo) {
    const [resultado] = await pool.query(
        `INSERT INTO talleres
        (nombre, instructor, fecha, cupo)
        VALUES (?, ?, ?, ?)`,
        [nombre, instructor, fecha, cupo]
    );

    return {
        id: resultado.insertId,
        nombre,
        instructor,
        fecha,
        cupo
    };
}

module.exports = {
    registrarAlumno,
    listarTalleres,
    obtenerPorId,
    crearTaller
};