const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { criar, relatorio } = require('../controllers/laboratorioController');
const auth = require('../middleware/authMiddleware');
const diaUtil = require('../middleware/weekdayMiddleware');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.post('/novo', auth, diaUtil, upload.single('foto'), criar);
router.get('/relatorio', auth, diaUtil, relatorio);

module.exports = router;
