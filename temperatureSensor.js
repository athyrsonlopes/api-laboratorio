const io = require('socket.io-client');
const API_URL = process.env.API_URL || 'http://localhost:3000'; 

const socket = io(API_URL);

let simulatedTemperature = 20.0; // Temperatura inicial
const labId = 'Laboratório Principal';

socket.on('connect', () => {
  console.log(`Simulador de Sensor conectado ao servidor da API: ${API_URL}`);


  setInterval(() => {
    const fluctuation = (Math.random() - 0.5) * 2;
    simulatedTemperature += fluctuation;

    if (simulatedTemperature > 28) simulatedTemperature = 28;
    if (simulatedTemperature < 18) simulatedTemperature = 18;

    simulatedTemperature = parseFloat(simulatedTemperature.toFixed(2));

    console.log(`Simulador: A enviar temperatura para ${labId}: ${simulatedTemperature}°C`);
    socket.emit('sendTemperature', { labId, temperature: simulatedTemperature });
  }, 3000);
});

socket.on('disconnect', () => {
  console.log('Simulador de Sensor desconectado do servidor da API.');
});

socket.on('connect_error', (err) => {
  console.error('Erro de conexão do simulador de sensor:', err.message);
});

