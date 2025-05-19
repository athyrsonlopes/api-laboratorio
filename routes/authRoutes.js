const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

router.post('/registro', register);
router.post('/logar', login);

module.exports = router;
