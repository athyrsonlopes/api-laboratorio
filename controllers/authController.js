const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(400).json({ erro: 'Usuário já existe' });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);
    const novoUsuario = new User({ email, senha: senhaCriptografada });
    await novoUsuario.save();

    res.status(201).json({ mensagem: 'Usuário criado com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao registrar usuário' });
  }
};

exports.login = async (req, res) => {
  const { email, senha } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(senha, user.senha))) {
    return res.status(401).json({ erro: 'Credenciais inválidas' });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
};
