/**
 * @fileoverview Integration tests for the diagnostic routes.
 * These tests use an in-memory MongoDB instance to simulate database connectivity
 * and verify that health check and error test endpoints behave as expected.
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');
const db = require('../lib/data/db');
const request = require('supertest');
const app = require('../app');

let mongoServer;
let connection;

/**
 * Set up an in-memory MongoDB server and inject its connection into the db singleton
 * before running the test suite.
 */
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  connection = await MongoClient.connect(uri);
  db._db = connection.db(); // inject test DB instance
});

/**
 * Tear down the database connection and stop the in-memory server
 * after all tests have completed.
 */
afterAll(async () => {
  await connection.close();
  await mongoServer.stop();
});

describe('Diagnostic Routes', () => {
  /**
   * Ensures that GET /v1/health_check returns HTTP 200 when the DB responds to a ping.
   */
  test('GET /v1/health_check returns 200', async () => {
    const res = await request(app).get('/v1/health_check');
    expect(res.statusCode).toBe(200);
  });

  /**
   * Ensures that GET /v1/throw_error returns HTTP 500 and includes an error message
   * when in development mode.
   */
  test('GET /v1/throw_error returns 500 in development', async () => {
    const res = await request(app).get('/v1/throw_error');
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toHaveProperty('message');
  });
});
