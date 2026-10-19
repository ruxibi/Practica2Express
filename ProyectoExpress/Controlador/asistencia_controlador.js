const asistenciaModel = require('../Modelo/asistencia_modelo');

async function registrarAsistencia(req, res) {
    try {
        const { id_taller, id_alumno, boleta, nombre_alumno } = req.body;

        if (!id_taller || !id_alumno || !boleta || !nombre_alumno) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        const datosAsistencia = { id_taller, id_alumno, boleta, nombre_alumno };
        const insertId = await asistenciaModel.registrarAsistencia(datosAsistencia);
        
        res.status(201).json({ 
            mensaje: 'Asistencia registrada correctamente', 
            id: insertId 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function consultarAlassistenciaPorTaller(req, res) {
    try {
        const { id_taller } = req.params;
        const filas = await asistenciaModel.consultarAsistenciaPorTaller(id_taller);
        
        res.json(filas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    registrarAsistencia,
    consultarAsistenciaPorTaller
};