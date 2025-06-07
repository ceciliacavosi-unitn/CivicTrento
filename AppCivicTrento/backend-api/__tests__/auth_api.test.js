const request = require('supertest');
const app = require('../main'); // il tuo file Express

describe('API: Login utente', () => {

  beforeAll(async () => {
    // Pre-registra un utente valido
    await request(app)
      .post('/register')
      .send({
        nome: 'Test',
        cognome: 'Login',
        email: 'login@example.com',
        password: 'Password@123',
        CF: 'RSSMRA80A01H501U',
        cartaID: 'AA1234567',
        gdprConsent: true
      });
  });

  test('Login con credenziali corrette', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: 'login@example.com',
        password: 'Password@123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined(); // se restituisci un JWT
  });

  test('Login con password sbagliata', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: 'login@example.com',
        password: 'errata'
      });

    expect(res.statusCode).toBe(401); // o 400 se gestito diversamente
    expect(res.body.detail || res.body.error).toMatch(/password/i);
  });

  test('Login con email non registrata', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: 'fake@example.com',
        password: 'qualcosa'
      });

    expect(res.statusCode).toBe(404); // o 401 o 400 a seconda della tua API
    expect(res.body.detail || res.body.error).toMatch(/non registrato/i);
  });

});

describe('API: Registrazione utente', () => {
  test('Registrazione fallisce con password troppo semplice', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        nome: 'Mario',
        cognome: 'Rossi',
        email: 'semplice@example.com',
        password: '12345',  // troppo semplice
        CF: 'RSSMRA80A01H501U',
        cartaID: 'AA1234567',
        gdprConsent: true
      });

    expect(res.statusCode).toBe(400); // o il codice che usi per validazione fallita
    expect(res.body.detail || res.body.error).toMatch(/password/i);
  });

  test('Registrazione con dati validi ha successo', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        nome: 'Luigi',
        cognome: 'Bianchi',
        email: 'luigi@example.com',
        password: 'Password@123',
        CF: 'RSSMRA80A01H501U',
        cartaID: 'AA1234567',
        gdprConsent: true
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true); // o il tuo messaggio di ritorno
  });
});
