const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
    nombre: String,
    fecha: Number,
    entradas: Array,
    recinto: Number
});

const entradaSchema = new mongoose.Schema({
    tipo: String,
    precio: Number,
    disponibles: Number
});

const Evento = mongoose.model('eventos', eventoSchema);
const Entradas = mongoose.model('entradas', entradaSchema);

module.exports = Evento;
module.exports = Entradas;