import mongoose from "mongoose"
import supertest from "supertest";
import app from "../app.js";
import User from "../models/user.js"
import { cleanUpDatabase, generateValidJwt } from "./utils.js"
// import User from "../models/user.js"
let johnDoe, editorUser, adminUser

beforeEach(async function() {
  cleanUpDatabase();
  johnDoe = await Promise.all([
    User.create({
      firstName: 'John',
      lastName: "Doe",
      username: "johndoe",
      password: "abcdefgh",
      role: "user"
    })
  ]);

  editorUser = await Promise.all([
    User.create({
      firstName: 'Jane',
      lastName: "Doe",
      username: "janedoe",
      password: "12345678",
      role: "editor"
    })
  ]);

  adminUser = await Promise.all([
    User.create({
      firstName: 'Aiam',
      lastName: "Zeboss",
      username: "admin",
      password: "12345678",
      role: "admin"
    })
  ]);
});

const firstName = "Damien";
const lastName = "Boechet";
const username = "dambo";
const password = "12345678";
let authToken, idUser, idRetrieved;


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
  test('should create a user', async function() {
    const token = await generateValidJwt(adminUser);
    const res = await supertest(app)
    .post('/users')
    .set('Authorization', `Bearer ${token}`)
    .send({
      firstName,
      lastName,
      username,
      password,
      role: 'editor',
    })
    .expect(200)
    .expect('Content-Type', /json/);

    idUser = res.body.id;

    // Check that the response body is a JSON object with exactly the properties we expect.
    expect(typeof res.body).toEqual("object");
    expect(typeof res.body.id).toBeString();
    expect(res.body.firstName).toEqual(firstName);
    expect(res.body.lastName).toEqual(lastName);
    expect(res.body.username).toEqual(username);
    expect(res.body.role).toEqual('editor');
    expect(res.body.password).toBeNil;
    expect(res.body).toContainAllKeys(['id','firstName', 'lastName', 'username', 'role']);
  });

  test('should refuse to create the same user (username)', async function() {
    const token = await generateValidJwt(adminUser);
    const res = await supertest(app)
    .post('/users')
    .set('Authorization', `Bearer ${token}`)
    .send({
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      password: "123456",
      role: 'username',
    })
    .expect(500)
    .expect('Content-Type', "text/html; charset=utf-8");
  });
});

describe('GET /users', function() {
  test('should refuse access (no token)', async function() {
    const res = await supertest(app)
    .get('/users')
    .expect(401)
    .expect('Content-Type', "text/plain; charset=utf-8");
  });
});

describe('POST /auth/login', function() {
  test.todo('should login and retrieve the auth token ?');
  // it('should login and retrieve the auth token', async function() {
  //   const res = await supertest(app)
  //   .post('/auth/login')
  //   .send({
  //     username: 'dambo',
  //     password: '12345678'
  //   })
  //   .expect(200)
  //   .expect('Content-Type', /json/);

  //   authToken = res.body.token;

  //   // Check that the response body is a JSON object with exactly the properties we expect.
  //   expect(typeof res.body).toEqual('object');
  //   expect(typeof res.body.token).toEqual('string');
  //   expect(res.body).toEqual(
  //     expect.objectContaining({
  //       token: expect.any(String),
  //     })
  //   );
  // });
});


describe(`GET /users`, function() {
  test('should retrieve users', async function() {
    const token = await generateValidJwt(adminUser);
    const res = await supertest(app)
    .get('/users')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /json/)
    expect(res.body).toBeArrayOfSize(3);
  });

  test('should retrieve the first 2 users (pagination)', async function() {
    const token = await generateValidJwt(adminUser);
    const res = await supertest(app)
    .get('/users?page=1&pageSize=2')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /json/)
    expect(res.body).toBeArrayOfSize(2);
  });
});

describe(`PATCH /users/:id`, function() {
  test('should update a user', async function() {
    const token = await generateValidJwt(adminUser);
    const res = await supertest(app)
    .patch(`/users/${editorUser[0]._id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      lastName: "Andermatt",
    })
    .expect(200)
    .expect('Content-Type', /json/);
    
    expect(res.body.lastName).toEqual("Andermatt");
    expect(res.body).toContainAllKeys(['id','firstName', 'lastName', 'username', 'role']);
  });
});

describe(' DELETE /users', function() {
  test('should delete a user', async function() {
    const token = await generateValidJwt(adminUser);
    const res = await supertest(app)
    .delete(`/users/${johnDoe[0]._id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});