const mongoose = require('mongoose');

const recintoSchema = new mongoose.Schema({
    nombre: String,
    direccion: String,
    localidad: String,
    aforoMaximo: Number
});

const Recinto = mongoose.model('libros', recintoSchema);

module.exports = Recinto;