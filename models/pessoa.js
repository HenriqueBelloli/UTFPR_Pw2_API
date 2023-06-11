const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Pessoa = Schema({
    nome: { type: String, required: true },
    idade: { type: Number, required: true },
    cpf: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true, default: ['CANDIDATO'] },
});

module.exports = mongoose.model("Pessoa", Pessoa)