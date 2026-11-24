const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const Recinto = require('./models/recinto');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MongoDB local.
const PUERTO = 8080;
const PANTALLA = "recintos";

mongoose.connect(`mongodb://localhost:27017/${PANTALLA}`)
    .then(() => console.log('Conectado a MongoDB'))
    .catch(error => console.log('Error de conexión:', error));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/*
GET /recintos: obtiene un listado de todos los recintos almacenados. Devolverá un código de estado 200
con un campo resultado que contenga el listado de recintos si hay al menos uno. Si no hay ningún
recinto, o falla la consulta, devolverá un código 500 con un campo error que contenga el mensaje
"No se han encontrado recintos".
*/
app.get(`/${PANTALLA}`, async (req, res) => {
    try {
        const recintos = await Recinto.find();
        if (recintos.length > 0) {
            res.status(200).json({ resultado: recintos });
        } else {
            res.status(500).json({ error: "No se han encontrado recintos" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los recintos" });
    }
});

/*
GET /recintos/:id: obtiene el recinto con el id indicado. Devolverá un código 200 y un campo
resultado con el recinto encontrado, si es satisfactorio. Si no se encuentra el recinto indicado (por
resultado nulo, o por error general), se devolverá un código 404 y un campo error con el mensaje
"Recinto X no encontrado", siendo X el id facilitado en la URL.
*/
app.get(`/${PANTALLA}/:id`, async (req, res) => {
    try {
        const idRecinto = req.params.id;
        const recinto = await Recinto.findById(idRecinto);
        if (recinto) {
            res.status(200).json({ resultado: recinto });
        } else {
            res.status(404).json({ error: `Recinto ${idRecinto} no encontrado` });
        }
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el recinto" });
    }
});

/*
GET /recintos/localidad/:nombre: obtiene los recintos que se encuentren en la localidad indicada.
Devolverá un código de estado 200 con un campo resultado que contenga el listado de recintos si
hay al menos uno. Si no hay ningún recinto, o falla la consulta, devolverá un código 404 con un campo
error que contenga el mensaje "No se han encontrado recintos de la localidad indicada".
*/
app.get(`/${PANTALLA}/localidad/:nombre`, async (req, res) => {
    try {
        const recintos = await Recinto.find({ localidad: req.params.localidad });
        if (recintos.length > 0) {
            res.status(200).json({ resultado: recintos });
        } else {
            res.status(404).json({ error: "No se han encontrado recintos de la localidad indicada" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los recintos por localidad" });
    }
});

/*
POST /recintos: añade un nuevo recinto a la colección, cuyos datos recibirá por JSON en el cuerpo de la
petición. Devolverá un código 201 (creado), junto con el objeto creado en un campo resultado , si
todo ha ido correctamente, o un código 500 con un campo error con el mensaje "Error añadiendo
recinto" si ha habido algún error.
*/
app.post(`/${PANTALLA}`, async (req, res) => {
    try {
        const nuevo = new Recinto({
            nombre: req.body.nombre.trim(),
            direccion: req.body.direccion.trim(),
            localidad: req.body.localidad.trim(),
            aforoMaximo: req.body.aforoMaximo
        });

        const resultado = await nuevo.save();
        res.status(201).json(resultado);
    } catch (error) {
        res.status(500).json({ error: "Error añadiendo recinto" });
    }
});

/*
DELETE /recintos/:id: elimina el recinto con el id indicado. Devolverá un código 200 y un campo
resultado con el recinto eliminado, si es satisfactorio. Si no se encuentra el recinto indicado
(resultado nulo o error en la operación), se devolverá un código 404 y un campo error con el mensaje
"Error eliminando recinto X", siendo X el id facilitado en la URL.
*/
app.delete(`/${PANTALLA}/:id`, async (req, res) => {
    try {
        const recinto = await Recinto.findByIdAndDelete(req.params.id);
        if (!recinto) return res.status(404).json({ error: `Error eliminando recinto ${req.params.id}` });
        res.status(200).json({ resultado: recinto });
    } catch (error) {
        res.status(500).json({ error: "Error eliminando recinto" });
    }
});

// Inicia el servidor en el puerto correspondiente.
app.listen(PUERTO, () => console.log(`Servidor escuchando en http://localhost:${PUERTO}/${PANTALLA}`));