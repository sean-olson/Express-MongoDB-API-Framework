/**
 * @fileoverview Integration tests for the Todo API CRUD endpoints.
 * Uses an in-memory MongoDB to seed predictable data and verifies
 * list, create, read-by-id, update, and delete behaviors via Supertest.
 */

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');
const app = require('../app');
const db = require('../lib/data/db');

let mongoServer;
let connection;
let todos;

/**
 * Start an in-memory MongoDB, connect a client, and seed the `todos` collection
 * before the tests run.
 */
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  connection = await MongoClient.connect(uri);
  db._db = connection.db();

  todos = db._db.collection('todos');
  await todos.insertMany([
    {
      task: 'Seed task 1',
      priority: 1,
      assigned_to: 'alice',
      is_complete: false,
      date_created: new Date()
    },
    {
      task: 'Seed task 2',
      priority: 2,
      assigned_to: 'bob',
      is_complete: true,
      date_created: new Date()
    }
  ]);
});

/**
 * Close the Mongo client and stop the in-memory server after tests complete.
 */
afterAll(async () => {
  await connection.close();
  await mongoServer.stop();
});

describe('Todo API', () => {
  /**
   * Should return all seeded todos.
   */
  test('GET /v1/todo should return all todos', async () => {
    const res = await request(app).get('/v1/todo');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  /**
   * Should create a todo and return 201 with the created document.
   */
  test('POST /v1/todo should create a new todo', async () => {
    const res = await request(app)
      .post('/v1/todo')
      .send({
        task: 'New Task',
        priority: 3,
        assigned_to: 'charlie',
        is_complete: false
      })
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(201);
    expect(res.body.task).toBe('New Task');
  });

  /**
   * Should fetch a single todo by its ObjectId and return 200.
   */
  test('GET /v1/todo/:id should return a single todo', async () => {
    const allTodos = await todos.find().toArray();
    const targetId = allTodos[0]._id.toString();

    const res = await request(app).get(`/v1/todo/${targetId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(targetId);
  });

  /**
   * Should update an existing todo field(s) and return 204 (no content).
   */
  test('PUT /v1/todo/:id should update a todo', async () => {
    const todoToUpdate = await todos.findOne({ task: 'Seed task 1' });

    const res = await request(app)
      .put(`/v1/todo/${todoToUpdate._id}`)
      .send({ is_complete: true })
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(204);

    const updated = await todos.findOne({ _id: todoToUpdate._id });
    expect(updated.is_complete).toBe(true);
  });

  /**
   * Should delete an existing todo and return 204; item should no longer exist.
   */
  test('DELETE /v1/todo/:id should remove a todo', async () => {
    const todoToDelete = await todos.findOne({ task: 'Seed task 2' });

    const res = await request(app).delete(`/v1/todo/${todoToDelete._id}`);
    expect(res.statusCode).toBe(204);

    const deleted = await todos.findOne({ _id: todoToDelete._id });
    expect(deleted).toBeNull();
  });
});
