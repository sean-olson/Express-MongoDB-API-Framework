/**
 * @fileoverview Provides CRUD operations for the "todos" MongoDB collection.
 * This module encapsulates database interactions for todo items, including
 * creation, retrieval, updating, and deletion.
 */

const db = require("../../lib/data/db");
const { castObjectId } = require("../../lib/utilities/mongo_utils");
const logger = require("../../lib/utilities/logger");

/**
 * Name of the MongoDB collection for todo items.
 * @type {string}
 */
const collectionName = "todos";

/**
 * Class representing a module for managing todo items.
 * @class
 */
class TodoDemoModule {
  /**
   * Retrieves the MongoDB collection instance for todos.
   * @type {import("mongodb").Collection}
   */
  get collection() {
    return db._db.collection(collectionName);
  }

  /**
   * Retrieves all todo items from the database.
   *
   * @async
   * @returns {Promise<Array<Object>>} Promise resolving to an array of todo objects.
   */
  async listAll() {
    logger.debug("Listing all todos");
    return this.collection.find().toArray();
  }

  /**
   * Retrieves a single todo item by its ID.
   *
   * @async
   * @param {string} id - The ID of the todo item to retrieve.
   * @returns {Promise<Object|null>} Promise resolving to the todo object, or null if not found.
   */
  async getById(id) {
    logger.debug(`Getting todo by ID: ${id}`);
    return this.collection.findOne({ _id: castObjectId(id) });
  }

  /**
   * Creates a new todo item in the database.
   *
   * @async
   * @param {Object} todo - The todo data to insert.
   * @returns {Promise<Object>} Promise resolving to the created todo object, including `_id`.
   */
  async create(todo) {
    todo.date_created = new Date();
    logger.info("Creating new todo", todo);
    const result = await this.collection.insertOne(todo);
    return { _id: result.insertedId, ...todo };
  }

  /**
   * Updates an existing todo item by ID.
   *
   * @async
   * @param {string} id - The ID of the todo to update.
   * @param {Object} update - The fields to update.
   * @returns {Promise<boolean>} Promise resolving to true if a document was modified; otherwise false.
   */
  async update(id, update) {
    logger.info(`Updating todo with ID: ${id}`, update);
    const result = await this.collection.updateOne(
      { _id: castObjectId(id) },
      { $set: update }
    );
    return result.modifiedCount > 0;
  }

  /**
   * Deletes a todo item by ID.
   *
   * @async
   * @param {string} id - The ID of the todo to delete.
   * @returns {Promise<boolean>} Promise resolving to true if a document was deleted; otherwise false.
   */
  async delete(id) {
    logger.warn(`Deleting todo with ID: ${id}`);
    const result = await this.collection.deleteOne({ _id: castObjectId(id) });
    return result.deletedCount > 0;
  }
}

/**
 * Singleton instance of the TodoDemoModule.
 * @type {TodoDemoModule}
 */
module.exports = new TodoDemoModule();
