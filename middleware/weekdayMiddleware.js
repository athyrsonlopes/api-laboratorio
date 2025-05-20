module.exports = (req, res, next) => {
  const dia = new Date().getDay();
  if (dia === 0 || dia === 6) {
    return res.status(403).json({ erro: 'Acesso apenas de segunda a sexta' });
  }
  next();
};
