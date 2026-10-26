const talleresModelo = require('../Modelo/talleres_modelo');

function esDuplicado(error) {
    return error.code === 'ER_DUP_ENTRY' || error.code === '23505';
}

// Listar talleres
async function listarTalleres(req, res) {
    try {
        const talleres = await talleresModelo.listarTalleres();

        res.json(talleres);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}

// Registrar alumno
async function registrarAlumno(req, res) {
    try {
        const { taller_id, nombre_alumno, boleta } = req.body;

        const registrado =
            await talleresModelo.registrarAlumno({
                taller_id,
                nombre_alumno,
                boleta
            });

        if (registrado) {
            res.json({
                message: 'Alumno registrado correctamente'
            });
        } else {
            res.status(400).json({
                error: 'No se pudo registrar al alumno'
            });
        }
    } catch (error) {
        if (esDuplicado(error)) {
            return res.status(400).json({
                error: 'El alumno ya está registrado en este taller'
            });
        }

        res.status(500).json({
            error: error.message
        });
    }
}

// Obtener un taller
async function obtenerTaller(req, res) {
    try {
        const taller = await talleresModelo.obtenerPorId(req.params.id);

        if (!taller) {
            return res.status(404).json({
                error: 'Taller no encontrado'
            });
        }

        res.json(taller);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}

// Crear taller
async function crearTaller(req, res) {
    try {
        const { nombre, instructor, fecha, cupo } = req.body;

        if (!nombre || !fecha) {
            return res.status(400).json({
                error: 'nombre y fecha son obligatorios'
            });
        }

        const taller = await talleresModelo.crearTaller(
            nombre,
            instructor,
            fecha,
            cupo
        );

        res.status(201).json(taller);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}

module.exports = {
    listarTalleres,
    registrarAlumno,
    obtenerTaller,
    crearTaller
};