require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const app = express();

const authRoutes = require('./routes/authRoutes');
const laboratorioRoutes = require('./routes/laboratorioRoutes');
const Temperatura = require('./models/Temperatura');

app.use(express.json());
app.use(express.static('public'));


app.get('/', (req, res) => res.send('Bem-vindo à API de Gerenciamento de Laboratórios!'));
app.use('/', authRoutes);
app.use('/laboratorio', laboratorioRoutes);

app.get('/videoTutorial', (req, res) => {
  const videoPath = path.join(__dirname, 'uploads', 'tutorial.mp4'); // Usando path.join
  if (!fs.existsSync(videoPath)) {
    return res.status(404).send('Arquivo de vídeo tutorial não encontrado.');
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});

app.get('/temperaturaAtual', async (req, res) => {
  try {
    const ultimaLeitura = await Temperatura.findOne().sort({ timestamp: -1 });
    if (!ultimaLeitura) {
      return res.status(404).json({ erro: 'Nenhuma leitura de temperatura disponível.' });
    }
    res.status(200).json({ 
        temperature: ultimaLeitura.temperatura, 
        unit: '°C', 
        labId: ultimaLeitura.laboratorio,
        timestamp: ultimaLeitura.timestamp 
    });
  } catch(err) {
    res.status(500).json({erro: 'Erro ao buscar temperatura'});
  }
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log(`Servidor rodando na porta ${process.env.PORT}`)
    );
  })
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

module.exports = app;