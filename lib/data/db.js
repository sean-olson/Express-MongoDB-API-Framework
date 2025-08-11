/**
 * @fileoverview Singleton-style MongoDB wrapper providing shared access
 * to a MongoDB connection and database handle across the application.
 *
 * This module handles:
 * - Building the MongoDB connection URI from environment variables.
 * - Connecting to MongoDB and storing a database reference.
 * - Closing the connection gracefully.
 *
 * @example
 * const db = require('./lib/data/db');
 * await db.connect();
 * const todos = db._db.collection('todos');
 */

const { MongoClient } = require("mongodb");
const env = require("../environment/environment");
const logger = require("../utilities/logger");

/**
 * @class Db
 * @classdesc Manages a single MongoDB client instance and database connection.
 */
class Db {
  /**
   * Creates a Db instance and initializes the MongoDB client.
   *
   * The URI is built from:
   * - `DB_URI` (if provided) or
   * - Individual DB connection environment variables (`DB_USER_NAME`, `DB_PASSWORD`, `DB_URL`, `DB_PORT`).
   *
   * @constructor
   */
  constructor() {
    /** @type {string} MongoDB connection URI */
    const uri =
      env.dbUri && env.dbUri.trim()
        ? env.dbUri.trim() // Use full URI if provided
        : (() => {
            const user = env.dbUsername ? encodeURIComponent(env.dbUsername) : "";
            const pass = env.dbPassword ? encodeURIComponent(env.dbPassword) : "";
            const auth = user && pass ? `${user}:${pass}@` : "";
            return `mongodb://${auth}${env.dbUrl}:${env.dbPort}`;
          })();

    /**
     * @private
     * @type {MongoClient}
     */
    this._client = new MongoClient(uri, {
      retryWrites: true,
      appName: env.serviceName || "Express-MongoDB API Framework",
    });

    /**
     * @private
     * @type {import('mongodb').Db|null}
     */
    this._db = null;
  }

  /**
   * Establish a connection to MongoDB and set the internal database handle.
   *
   * @async
   * @throws {Error} If the connection attempt fails.
   * @returns {Promise<void>}
   */
  async connect() {
    try {
      await this._client.connect();
      this._db = this._client.db(env.dbName);
      logger.info(`Connected to MongoDB: ${env.dbName}`);
    } catch (err) {
      logger.error("Failed to connect to MongoDB:", err);
      throw err;
    }
  }

  /**
   * Closes the MongoDB client connection.
   *
   * @async
   * @returns {Promise<void>}
   */
  async close() {
    await this._client.close();
    logger.info("🔌 MongoDB connection closed.");
  }
}

/**
 * Singleton Db instance.
 * @type {Db}
 */
const db = new Db();

module.exports = db;
