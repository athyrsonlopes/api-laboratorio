const express = require('express');
const router = express.Router();
const { criar, relatorio } = require('../controllers/laboratorioController');
const auth = require('../middleware/authMiddleware');
const diaUtil = require('../middleware/weekdayMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/novo', auth, diaUtil, upload.single('foto'), criar);
router.get('/relatorio', auth, diaUtil, relatorio);

module.exports = router;