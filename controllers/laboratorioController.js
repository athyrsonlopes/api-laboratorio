const Laboratorio = require('../models/Laboratorio');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const axios = require('axios'); // <== importante

exports.relatorio = async (req, res) => {
  try {
    const labs = await Laboratorio.find();
    const doc = new PDFDocument();
    const filePath = path.join(__dirname, '..', 'uploads', 'relatorio.pdf');
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    for (const lab of labs) {
      doc.fontSize(14).text(`Nome: ${lab.nome}`);
      doc.fontSize(12).text(`Descrição: ${lab.descricao}`);
      doc.text(`Capacidade: ${lab.capacidade}`);

      // Tentar baixar a imagem da URL
      try {
        const response = await axios.get(lab.foto, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');
        doc.image(imageBuffer, { width: 100 });
      } catch (imgErr) {
        doc.text('Erro ao carregar imagem.');
        console.error(`Erro ao carregar imagem do laboratório ${lab.nome}:`, imgErr.message);
      }

      doc.moveDown();
    }

    doc.end();

    stream.on('finish', () => {
      res.download(filePath);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao gerar relatório' });
  }
};




