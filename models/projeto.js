const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Projeto = Schema({
  nome: { type: String, required: true },
  descricao: { type: String, required: true },
  anoinicio: { type: Number, required: true },
  anofim: { type: Number, required: true },
  responsavel: {
    type: Schema.Types.ObjectId,
    ref: 'Pessoa',
    required: true,
  },
  popularidade: { type: Number, required: false, default: 0 }
});

module.exports = mongoose.model("Projeto", Projeto)