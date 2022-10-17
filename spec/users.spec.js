import supertest from "supertest";
import app from "../app.js";


/* Structure:
describe('VERB /link', function() {
  it('short description', async function() {
    const res = await supertest(app)
    .post('/link')
    .send({ //body
      // name: 'John Doe',
      // etc: '...'
    })
    .expect(200) // number: expected status code
    .expect('Content-Type', /json/);// ('header', value)
  });
});*/

describe('POST /users', function() {
  it('should create a user', async function() {
    const res = await supertest(app)
    .post('/users')
    .send({
      name: 'John Doe',
      password: '1234'
    })
    .expect(200)
    .expect('Content-Type', /json/);
  });
});

describe('GET /users', function() {
  test.todo('should retrieve the list of users');
});