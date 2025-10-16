
const request = require('supertest')
const app = require('./server')

describe('Test my app server', () => {
  it('Deve retornar minha rota pricipal', async () => {
    const res = await request(app).get('/')
    expect(res.statusCode).toBe(200);
  });

  it('Deve retornar status 200 para a rota /', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
  });

  it('Deve retornar status 200 para a rota /sharks', async () => {
    const response = await request(app).get('/sharks');
    expect(response.status).toBe(200);
  });

  it('Deve retornar o conteúdo correto para a rota /', async () => {
    const response = await request(app).get('/');
    expect(response.text).toContain('<title>About Sharks</title>'); // Verifique se o conteúdo da resposta contém 'index.html'
  });

  it('Deve retornar o conteúdo correto para a rota /sharks', async () => {
    const response = await request(app).get('/sharks');
    expect(response.text).toContain('<h1>Shark Info</h1>'); // Verifique se o conteúdo da resposta contém 'sharks.html'
  });
});
