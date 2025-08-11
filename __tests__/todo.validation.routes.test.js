/**
 * @fileoverview Integration tests validating request-body schema enforcement
 * for the Todo API. Verifies 422 responses for missing required fields,
 * additional properties, and type mismatches. Also confirms that partial
 * updates still reject unknown fields.
 */

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');
const app = require('../app');
const db = require('../lib/data/db');

let mongoServer;
let connection;

/**
 * Boot an in-memory MongoDB instance and inject its DB handle into the app
 * before running the validation tests.
 */
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  connection = await MongoClient.connect(uri);
  db._db = connection.db();
});

/**
 * Clean up database resources after the test suite completes.
 */
afterAll(async () => {
  await connection.close();
  await mongoServer.stop();
});

describe('Todo API – validation', () => {
  /**
   * Should return 422 when required fields are missing from the POST body.
   */
  test('POST /v1/todo 422 when required fields are missing', async () => {
    const res = await request(app).post('/v1/todo').send({ task: 'Only task' });
    expect(res.statusCode).toBe(422);
    expect(res.body.error.message).toMatch(/must have required property/);
  });

  /**
   * Should return 422 when the POST body includes properties not defined by the schema.
   */
  test('POST /v1/todo 422 when additional properties are present', async () => {
    const res = await request(app).post('/v1/todo').send({
      task: 'Task',
      priority: 1,
      assigned_to: 'alice',
      is_complete: false,
      extra: 'nope'
    });
    expect(res.statusCode).toBe(422);
    expect(res.body.error.message).toMatch(/must NOT have additional properties/);
  });

  /**
   * Should return 422 when type coercion fails (e.g., non-numeric priority).
   */
  test('POST /v1/todo 422 when type coercion fails', async () => {
    const res = await request(app).post('/v1/todo').send({
      task: 'Task',
      priority: 'high', // not a number
      assigned_to: 'alice',
      is_complete: false
    });
    expect(res.statusCode).toBe(422);
    expect(res.body.error.message).toMatch(/must be number/);
  });

  /**
   * Should return 422 on PUT when unknown fields are present,
   * even in partial validation mode.
   */
  test('PUT /v1/todo/:id 422 when body has unknown fields (partial mode still blocks extras)', async () => {
    // seed a valid todo
    const create = await request(app).post('/v1/todo').send({
      task: 'Seed',
      priority: 1,
      assigned_to: 'bob',
      is_complete: false
    });
    const id = create.body._id;

    // attempt partial update with extra field
    const res = await request(app).put(`/v1/todo/${id}`).send({ is_complete: true, whoops: 1 });
    expect(res.statusCode).toBe(422);
    expect(res.body.error.message).toMatch(/must NOT have additional properties/);
  });
});
