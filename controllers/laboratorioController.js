const Laboratorio = require('../models/Laboratorio');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.criar = async (req, res) => {
  const { nome, descricao, capacidade } = req.body;
  const foto = req.file.filename;

  const lab = new Laboratorio({ nome, descricao, capacidade, foto });
  await lab.save();
  res.status(201).json(lab);
};

exports.relatorio = async (req, res) => {
  try {
    const labs = await Laboratorio.find();
    const doc = new PDFDocument();
    const filePath = path.join(__dirname, '..', 'uploads', 'relatorio.pdf');
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    labs.forEach(lab => {
      doc.fontSize(14).text(`Nome: ${lab.nome}`);
      doc.fontSize(12).text(`Descrição: ${lab.descricao}`);
      doc.text(`Capacidade: ${lab.capacidade}`);

      const fotoPath = path.join(__dirname, '..', 'uploads', lab.foto);
      if (fs.existsSync(fotoPath)) {
        doc.image(fotoPath, { width: 100 });
      }

      doc.moveDown();
    });

    doc.end();

    stream.on('finish', () => {
      res.download(filePath);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao gerar relatório' });
  }
};



