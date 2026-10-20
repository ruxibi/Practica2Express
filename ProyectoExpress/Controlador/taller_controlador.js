const bcrypt = require('bcryptjs');

const talleresModel = require('../Modelo/taller_modelo');


function esDuplicado(error){
    return error.code === 'ER_DUP_ENTRY' || error.code === '23505';
}


async function listarTalleres(req, res) {
    try{
        const talleres = await talleresModel.listar();
        res.json(talleres);
    }catch(error){
        res.status(500).json({error: error.message});
    }
}

async function registrarAlumno(req, res) {
    try{
        const {taller_id, nombre_alumno, boleta} = req.body;
        const registrado = await registrarAlumno({taller_id, nombre_alumno, boleta});
        if(registrado){
            res.json({message: 'Alumno registrado al taller correctamente'});
        }else{
            res.status(400).json({error: 'No se pudo registrar al alumno al taller'});
        }
    }catch(error){
        if(esDuplicado(error)){
            res.status(400).json({error: 'El alumno ya está registrado en este taller'});
        }
        res.status(500).json({error: error.message});
    }
}