const request = require('supertest');
const app = require('../index');

describe('API de Laboratório', () => {
  it('deve retornar erro ao logar com credenciais inválidas', async () => {
    const res = await request(app)
      .post('/logar')
      .send({ email: 'fake@example.com', senha: '123456' });

    expect(res.status).toBe(401);
    expect(res.body.erro).toBeDefined();
  });
});
