const Laboratorio = require('../models/Laboratorio');
const PDFDocument = require('pdfkit');
const fetch = require('node-fetch');
const { Readable } = require('stream');
const { put } = require('@vercel/blob');
const axios = require('axios');

exports.criar = async (req, res) => {
  try {
    const { nome, descricao, capacidade } = req.body;

    if (!req.file) {
      return res.status(400).json({ erro: 'A imagem é obrigatória.' });
    }

    const blob = await put(req.file.originalname, req.file.buffer, {
      access: 'public',
    });

    const lab = new Laboratorio({
      nome,
      descricao,
      capacidade,
      foto: blob.url,
    });

    await lab.save();
    res.status(201).json(lab);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar laboratório' });
  }
};

exports.listarTodos = async (req, res) => {
  try {
    const labs = await Laboratorio.find();
    res.status(200).json(labs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao listar laboratórios' });
  }
};

exports.excluir = async (req, res) => {
  try {
    const { id } = req.params;

    const lab = await Laboratorio.findById(id);
    if (!lab) {
      return res.status(404).json({ erro: 'Laboratório não encontrado.' });
    }

    if (lab.foto) {
      try {
        const { del } = require('@vercel/blob');
        await del(lab.foto);
        console.log(`Imagem ${lab.foto} excluída com sucesso do Vercel Blob.`);
      } catch (blobErr) {
        console.warn(`Aviso: Não foi possível excluir a imagem do Vercel Blob (${lab.foto}). Pode já não existir ou ter ocorrido um erro:`, blobErr);
      }
    }

    await Laboratorio.findByIdAndDelete(id); // Exclui o laboratório do MongoDB
    res.status(200).json({ mensagem: 'Laboratório excluído com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao excluir laboratório' });
  }
};

exports.relatorio = async (req, res) => {
  try {
    const labs = await Laboratorio.find();
    const doc = new PDFDocument();

    res.setHeader('Content-disposition', 'attachment; filename=relatorio.pdf');
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    for (const lab of labs) {
      doc.fontSize(14).text(`Nome: ${lab.nome}`);
      doc.fontSize(12).text(`Descrição: ${lab.descricao}`);
      doc.text(`Capacidade: ${lab.capacidade}`);

      if (lab.foto && lab.foto.startsWith('https://')) {
        try {
          const response = await axios.get(lab.foto, { responseType: 'arraybuffer' });
          const imageBuffer = Buffer.from(response.data, 'base64');

          doc.image(imageBuffer, { width: 100 });
        } catch (err) {
          doc.text('[Erro ao carregar imagem]');
        }
      }

      doc.moveDown();
    }

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao gerar relatório' });
  }
};