require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"] 
  }
});

const authRoutes = require('./routes/authRoutes');
const laboratorioRoutes = require('./routes/laboratorioRoutes');

app.get('/', (req, res) => res.send('Bem-vindo à API de Gerenciamento de Laboratórios!'));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/', authRoutes);
app.use('/laboratorio', laboratorioRoutes); 

let currentLabTemperature = 22.0;


app.get('/videoTutorial', (req, res) => {
  const videoPath = path.resolve(__dirname, 'uploads', 'tutorial.mp4'); 
  if (!fs.existsSync(videoPath)) {
    return res.status(404).send('Ficheiro de vídeo tutorial não encontrado.');
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
app.get('/temperaturaAtual', (req, res) => {
    res.status(200).json({ temperature: currentLabTemperature, unit: '°C', labId: 'Laboratório Principal' });
});

io.on('connection', (socket) => {
  console.log('Cliente conectado via WebSocket:', socket.id);

  socket.on('sendTemperature', (data) => {
    console.log(`Temperatura recebida do simulador: ${data.temperature}°C para ${data.labId}`);
    currentLabTemperature = data.temperature; // Atualiza a temperatura global
    socket.broadcast.emit('updateTemperature', data); 
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado via WebSocket:', socket.id);
  });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    server.listen(process.env.PORT, () =>
      console.log(`Servidor rodando na porta ${process.env.PORT}`)
    );
  })
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

module.exports = app;