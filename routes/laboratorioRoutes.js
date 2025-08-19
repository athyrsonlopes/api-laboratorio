const express = require('express');
const router = express.Router();
const { criar, relatorio, listarTodos, excluir } = require('../controllers/laboratorioController'); 
const auth = require('../middleware/authMiddleware');
const diaUtil = require('../middleware/weekdayMiddleware');
const upload = require('../middleware/uploadMiddleware');
const Laboratorio = require('../models/Laboratorio');
const Temperatura = require('../models/Temperatura');
const Pusher = require('pusher');

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});


router.get('/relatorio', auth, diaUtil, relatorio);

router.post('/novo', auth, diaUtil, upload.single('foto'), criar);

router.get('/listar', auth, diaUtil, listarTodos);

router.post('/atualizar-temperatura', async (req, res) => {
  try {
    let temperaturaAtual = 22.0;
    const ultimaLeitura = await Temperatura.findOne().sort({ timestamp: -1 });
    
    if (ultimaLeitura) {
      temperaturaAtual = ultimaLeitura.temperatura;
    }

  
    const variacao = (Math.random() - 0.5) * 2;
    let novaTemperatura = parseFloat((temperaturaAtual + variacao).toFixed(2));

    const novaLeitura = new Temperatura({
      temperatura: novaTemperatura,
      laboratorio: 'Laboratório Principal'
    });
    await novaLeitura.save();

    console.log(`[CRON] Temperatura salva: ${novaTemperatura}°C`);
    res.status(200).json({ sucesso: true, temperatura: novaTemperatura });

  } catch (error) {
    console.error('[CRON] Erro ao atualizar temperatura:', error);
    res.status(500).json({ sucesso: false });
  }
});

router.post('/bloquear/:id', auth, diaUtil, async (req, res) => {
  try {
    const { id } = req.params;
    const laboratorio = await Laboratorio.findById(id);

    if (!laboratorio) {
      return res.status(404).json({ mensagem: 'Laboratório não encontrado.' });
    }

    const payload = {
      _id: laboratorio._id,
      nome: laboratorio.nome,
      timestamp: new Date().toISOString()
    };

    await pusher.trigger('laboratorios', 'bloqueio', payload);
    
    res.status(200).json({ mensagem: `Sinal de bloqueio enviado para o laboratório '${laboratorio.nome}'.` });

  } catch (error) {
    console.error('Erro ao bloquear laboratório:', error);
    res.status(500).json({ erro: 'Erro interno ao processar bloqueio.' });
  }
});

router.delete('excluir/:id', auth, diaUtil, excluir);

module.exports = router;