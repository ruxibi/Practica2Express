const express = require('express');
const tallerControlador = require('./Controlador/taller_controlador');
const asistenciaControlador = require('./Controlador/asistencia_controlador');
const usuarioControlador = require('./Controlador/usuario_controlador');


const app = express();


app.use(express.json());

const PORT = 4000;



//ejemplo de una petición por medio de ruta principal GET
app.get('/saludo', (req, res)=>{
    res.json({mensaje:'Hola esto es una prueba en GET'});
});

app.post('/eco', (req, res)=>{
    const {texto} = req.body;
    if(!texto){
        return res.status(400).json({error:'El texto es obligatorio'});
    }
    res.status(201).json({eco:texto});
});

app.get('/api/talleres', tallerControlador.listarTalleres);
app.get('/api/talleres/:id', tallerControlador.obtenerTaller);
app.post('/api/talleres', tallerControlador.crearTaller);
app.post('/api/asistencias', asistenciaControlador.registrarAsistencia);
app.get('/api/talleres/:tallerId/asistencias',asistenciaControlador.consultarAsistenciaPorTaller);
app.get('/api/usuarios', usuarioControlador.listarUsuarios);
app.get('/api/usuarios/:id', usuarioControlador.obtenerUsuario);
app.post('/api/usuarios', usuarioControlador.crearUsuario);
app.put('/api/usuarios/:id', usuarioControlador.actualizarUsuario);
app.delete('/api/usuarios/:id', usuarioControlador.eliminarUsuario);

app.get('/', (req, res) => {
    res.json({ mensaje: 'API de Registro de Asistencia - CECyT 9 funcionando correctamente' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor escuchando en la red en el puerto: ${PORT}`);
});

