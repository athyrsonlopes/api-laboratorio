require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const authRoutes = require('./routes/authRoutes');
const labRoutes = require('./routes/laboratorioRoutes');

app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/', authRoutes);
app.use('/laboratorio', labRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log(`Servidor rodando na porta ${process.env.PORT}`)
    );
  })
  .catch(err => console.error(err));

module.exports = app; // para testes
