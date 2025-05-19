const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: String,
  senha: String,
});

module.exports = mongoose.model('User', userSchema);
