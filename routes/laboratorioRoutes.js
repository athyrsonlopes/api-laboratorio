const express = require('express');
const router = express.Router();
const { criar, relatorio, listarTodos, excluir } = require('../controllers/laboratorioController'); 
const auth = require('../middleware/authMiddleware');
const diaUtil = require('../middleware/weekdayMiddleware');
const upload = require('../middleware/uploadMiddleware');


router.get('/relatorio', auth, diaUtil, relatorio);

router.post('/novo', auth, diaUtil, upload.single('foto'), criar);

router.get('/listar', auth, diaUtil, listarTodos);

router.post('/bloquear/:labId', auth, diaUtil, (req, res) => {
  const { labId } = req.params;
  console.log(`Backend: Requisição de bloqueio para o laboratório ${labId} recebida.`);
  req.io.emit('bloquear', { labId, timestamp: new Date().toISOString() });
  res.status(200).json({ mensagem: `Sinal de bloqueio enviado para o laboratório ${labId}.` });
});


router.delete('/:id', auth, diaUtil, excluir);

module.exports = router;