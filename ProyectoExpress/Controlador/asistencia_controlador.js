const asistenciaModel = require('../Modelo/asistencia_modelo');

async function registrarAsistencia(req, res) {
    try {
        const { taller_id, boleta, nombre_alumno } = req.body;

        if (!taller_id || !boleta || !nombre_alumno) {
            return res.status(400).json({
                error: 'Todos los campos son obligatorios'
            });
        }

        const asistencia =
            await asistenciaModel.registrarAsistencia({
                taller_id,
                boleta,
                nombre_alumno
            });

        res.status(201).json(asistencia);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}

async function consultarAsistenciaPorTaller(req, res) {
    try {
        const { tallerId} = req.params;
        const filas = await asistenciaModel.consultarAsistenciaPorTaller(tallerId);
        
        res.json(filas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    registrarAsistencia,
    consultarAsistenciaPorTaller
};