/**
 * @fileoverview Integration tests for not-found paths in the Todo API.
 * Uses an in-memory MongoDB instance and Supertest to verify that
 * GET, PUT, and DELETE requests for non-existent resources return 404.
 */

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');
const app = require('../app');
const db = require('../lib/data/db');

let mongoServer;
let connection;

/**
 * Spin up an in-memory MongoDB and inject its DB into the app's db singleton
 * before running tests.
 */
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  connection = await MongoClient.connect(uri);
  db._db = connection.db();
});

/**
 * Close DB connection and stop the in-memory MongoDB server after tests finish.
 */
afterAll(async () => {
  await connection.close();
  await mongoServer.stop();
});

describe('Todo API – not found paths', () => {
  /** A syntactically valid ObjectId that will not exist in the test DB. */
  const missingId = '507f1f77bcf86cd799439011';

  /**
   * Should return 404 when attempting to fetch a non-existent todo.
   */
  test('GET /v1/todo/:id returns 404 when missing', async () => {
    const res = await request(app).get(`/v1/todo/${missingId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error.message).toMatch(/Todo not found/);
  });

  /**
   * Should return 404 when attempting to update a non-existent todo.
   */
  test('PUT /v1/todo/:id returns 404 when missing', async () => {
    const res = await request(app).put(`/v1/todo/${missingId}`).send({ is_complete: true });
    expect(res.statusCode).toBe(404);
    expect(res.body.error.message).toMatch(/not found or not modified/);
  });

  /**
   * Should return 404 when attempting to delete a non-existent todo.
   */
  test('DELETE /v1/todo/:id returns 404 when missing', async () => {
    const res = await request(app).delete(`/v1/todo/${missingId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error.message).toMatch(/Todo not found/);
  });
});
