const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjetoCandidatos = Schema({
  projeto: {
    type: Schema.Types.ObjectId,
    ref: 'Projeto',
    required: true,
  },
  candidato: {
    type: Schema.Types.ObjectId,
    ref: 'Pessoa',
    required: true,
  },
  selecionado: {
    type: Boolean,
    required: false,
    default: false
  }
});

module.exports = mongoose.model("ProjetoCandidatos", ProjetoCandidatos)