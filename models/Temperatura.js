const mongoose = require('mongoose');

const temperaturaSchema = new mongoose.Schema({
  temperatura: Number,
  laboratorio: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Temperatura', temperaturaSchema);