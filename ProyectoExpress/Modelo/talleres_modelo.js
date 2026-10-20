const pool = require('../bd-local'); 

const COLUMNAS_PUBLICAS = 'id, nombre, instructor, fecha, cupo'; 

//Registrar alumno al taller

async function registrarAlumno({taller_id, nombre_alumno, boleta}) {
    const[info] = await pool.query(
        `INSERT INTO asistencias (taller_id, nombre_alumno, boleta) 
        VALUES (?, ?, ?)`, [taller_id, nombre_alumno, boleta]
    );
    return info.affectedRows > 0; 
}

//Función para consultar todos los talleres 
async function listarTalleres(){
    const [filas] = await pool.query(`
        SELECT ${COLUMNAS_PUBLICAS} FROM talleres ORDER BY id`); 
        return filas; 
}


module.exports = {registrarAlumno, listarTalleres}; 

