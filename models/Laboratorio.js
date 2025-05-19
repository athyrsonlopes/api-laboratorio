const mongoose = require('mongoose');

const laboratorioSchema = new mongoose.Schema({
  nome: String,
  descricao: String,
  capacidade: Number,
  foto: String,
});

module.exports = mongoose.model('Laboratorio', laboratorioSchema);
