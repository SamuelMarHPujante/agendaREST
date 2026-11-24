const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const Evento = require('./models/evento');
const Entrada = require('./models/evento');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MongoDB local.
const PUERTO = 8080;
const PANTALLA = "eventos";
const SUBPANTALLA = "entradas";

mongoose.connect(`mongodb://localhost:27017/${PANTALLA}`)
    .then(() => console.log('Conectado a MongoDB'))
    .catch(error => console.log('Error de conexión:', error));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/*
GET /eventos: obtiene un listado de todos los eventos almacenados. Devolverá un código de estado 200
con un campo resultado que contenga el listado de eventos si hay al menos uno, con toda la
información de recinto y entradas (usa populate cuando sea necesario). Si no hay ningún evento, o
falla la consulta, devolverá un código 500 con un campo error que contenga el mensaje "No se han
encontrado eventos".
*/
app.get(`/${PANTALLA}`, async (req, res) => {
    try {
        const eventos = await Evento.find();
        if (eventos.length > 0) {
            res.status(200).json({ resultado: eventos });
        } else {
            res.status(500).json({ error: "No se han encontrado eventos" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los eventos" });
    }
});

/*
GET /eventos/:id: obtiene el evento con el id indicado. Devolverá un código 200 y un campo
resultado con el evento encontrado, si es satisfactorio. Si no se encuentra el evento indicado
(resultado nulo o error en la consulta), se devolverá un código 404 y un campo error con el mensaje
"Evento X no encontrado", siendo X el id facilitado en la URL.
*/
app.get(`/${PANTALLA}/:id`, async (req, res) => {
    try {
        const idEvento = req.params.id;
        const evento = await Evento.findById(idEvento);
        if (evento) {
            res.status(200).json({ resultado: evento });
        } else {
            res.status(404).json({ error: `Evento ${idEvento} no encontrado` });
        }
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el evento" });
    }
});

/*
GET /eventos/localidad/:nombre: obtiene los eventos que se encuentren en la localidad indicada y
cuya fecha aún no haya pasado. Devolverá un código de estado 200 con un campo resultado que
contenga el listado de eventos si hay al menos uno. Si no hay ningún evento, o falla la consulta,
devolverá un código 404 con un campo error que contenga el mensaje "No se han encontrado
eventos".
*/
app.get(`/${PANTALLA}/localidad/:nombre`, async (req, res) => {
    try {
        const eventos = await Evento.find({ localidad: req.params.nombre });
        if (eventos.length > 0) {
            res.status(200).json({ resultado: eventos });
        } else {
            res.status(404).json({ error: "No se han encontrado eventos" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los eventos por localidad" });
    }
});

/*
POST /eventos: añade un nuevo evento a la colección, cuyos datos recibirá por JSON en el cuerpo de la
petición. Devolverá un código 201 (creado), junto con el objeto creado en un campo resultado , si
todo ha ido correctamente, o un código 500 con un campo error con el mensaje "Error añadiendo
evento" si ha habido algún error.
*/
app.post(`/${PANTALLA}`, async (req, res) => {
    try {
        const nuevo = new Evento({
            nombre: req.body.nombre.trim(),
            fecha: req.body.fecha,
            entradas: req.body.entradas,
            recinto: req.body.recinto
        });

        const resultado = await nuevo.save();
        res.status(201).json(resultado);
    } catch (error) {
        res.status(500).json({ error: "Error añadiendo evento" });
    }
});

/*
PUT /eventos/:id: actualiza los datos del evento con el id indicado. Devolverá un código 200 y un campo
resultado con el evento actualizado, si es satisfactorio. Si no se encuentra el evento indicado
(resultado nulo o error en la operación), se devolverá un código 404 con un campo error con el
mensaje "Error actualizando evento X", siendo X el id facilitado en la URL.
*/
app.put(`/${PANTALLA}/:id`, async (req, res) => {
    try {
        const datos = {
            nombre: req.body.nombre.trim(),
            fecha: req.body.fecha,
            entradas: req.body.entradas,
            recinto: req.body.recinto
        };

        const evento = await Evento.findByIdAndUpdate(
            req.params.id,
            datos,
            { returnDocument: 'after' }
        );

        if (!evento) return res.status(404).json({ error: `Error actualizando evento ${req.params.id}` });
        res.json(evento);

    } catch (error) {
        res.status(500).json({ error: "Error al modificar el evento" });
    }
});

/*
DELETE /eventos/:id: elimina el evento con el id indicado. Devolverá un código 200 y un campo
resultado con el evento eliminado, si es satisfactorio. Si no se encuentra el evento indicado
(resultado nulo o error en la operación), se devolverá un código 404 y un campo error con el mensaje
"Error eliminando evento X", siendo X el id facilitado en la URL.
*/
app.delete(`/${PANTALLA}/:id`, async (req, res) => {
    try {
        const evento = await Evento.findByIdAndDelete(req.params.id);
        if (!evento) return res.status(404).json({ error: `Error eliminando evento ${req.params.id}` });
        res.status(200).json({ resultado: evento });
    } catch (error) {
        res.status(500).json({ error: "Error eliminando evento" });
    }
});

// ======ENTRADAS======
/*
GET /eventos/entradas/:idEvento/:tipoEntrada: obtiene el precio y el número de entradas disponibles
del evento indicado, para el tipo de entrada indicada. Si se encuentra la información, se enviará un
código 200 junto con un campo resultado que internamente tendrá dos subcampos ( precio y
disponibles ). Si no se encuentra o se produce algún error en la consulta, se devolverá un código 404
con el campo error con el mensaje "Error obteniendo datos de entrada para evento X", siendo X el id
de evento facilitado
*/

/*
PUT /eventos/entradas/:idEvento/:tipoEntrada/:cantidad: resta la cantidad de entradas de las
disponibles para el evento y tipo de entrada indicados. Por ejemplo, para idEvento=3, tipoEntrada=VIP y
cantidad=5 restaría 5 entradas disponibles de tipo VIP en el evento 3. Devolverá un código 200 si se ha
podido realizar correctamente, y un campo resultado con el evento y sus entradas actualizadas. Si
falla la operación, o no hay tantas entradas disponibles para restar, se devolverá un código 404 con un
campo error que diga "Error actualizando entradas del evento X", siendo X el id del evento facilitado.
*/

// Inicia el servidor en el puerto correspondiente.
app.listen(PUERTO, () => console.log(`Servidor escuchando en http://localhost:${PUERTO}/${PANTALLA}`));