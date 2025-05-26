// tests/app.test.js
const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');

let token = '';
const emailTeste = `teste${Date.now()}@email.com`;

afterAll(async () => {
    await mongoose.connection.close();
});

describe('API de Laboratório', () => {
    it('deve cadastrar um novo usuário com sucesso', async () => {
        const res = await request(app)
            .post('/registro')
            .send({ email: emailTeste, senha: '123456' });
        expect(res.status).toBe(201);
        expect(res.body.mensagem).toBe('Usuário criado com sucesso!');
    });

    it('deve logar com sucesso e retornar um token', async () => {
        const res = await request(app)
            .post('/logar')
            .send({ email: emailTeste, senha: '123456' });
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
        token = res.body.token;
    });

    it('deve retornar erro ao logar com credenciais inválidas', async () => {
        const res = await request(app)
            .post('/logar')
            .send({ email: 'fake@example.com', senha: '123456' });
        expect(res.status).toBe(401);
        expect(res.body.erro).toBeDefined();
    });

    it('deve retornar erro ao tentar criar laboratório sem imagem', async () => {
        const res = await request(app)
            .post('/laboratorio/novo')
            .set('Authorization', `Bearer ${token}`)
            .field('nome', 'Teste sem imagem')
            .field('descricao', 'Teste')
            .field('capacidade', 20);
        expect(res.status).toBeGreaterThanOrEqual(400);
    });
});