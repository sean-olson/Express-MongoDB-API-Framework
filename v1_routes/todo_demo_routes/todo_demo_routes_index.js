/**
 * @fileoverview Routes for handling CRUD operations on the /v1/todo endpoint.
 * Applies schema validation, user authentication, and MongoDB ObjectId parameter validation.
 */

const { authenticate_user } = require("../../lib/auth/authenticate_user");
const createError = require("http-errors");
const todos = require("./todo_demo_module");
const logger = require("../../lib/utilities/logger");
const { getSchemaValidator } = require("../../v1_schema/validation");
const { validateObjectIdParamHandler } = require("../../lib/utilities/mongo_utils");

/**
 * Registers the todo routes with the given Express application.
 * 
 * @param {import("express").Express} app - The Express application instance.
 */
module.exports = (app) => {
  /**
   * Registers middleware to automatically validate any `:id` route parameter
   * as a MongoDB ObjectId.
   * 
   * If the value is invalid, responds with `400 Bad Request` before reaching the route handler.
   * 
   * @note This can be moved to `app.js` so it is only declared once and applied globally
   * to all routes that use an `:id` parameter, eliminating repetition in each route file.
   */
  app.param("id", validateObjectIdParamHandler);

  /**
   * GET /v1/todo
   * Fetches all todo items.
   */
  app.get("/v1/todo", authenticate_user, async (req, res, next) => {
    try {
      const all = await todos.listAll();
      logger.info("Fetched all todos");
      res.json(all);
    } catch (err) {
      logger.error("Failed to list todos", { error: err });
      next(err);
    }
  });

  /**
   * GET /v1/todo/:id
   * Fetches a specific todo item by ID.
   */
  app.get("/v1/todo/:id", authenticate_user, async (req, res, next) => {
    try {
      const todo = await todos.getById(req.params.id);
      if (!todo) {
        logger.warn(`Todo not found: ${req.params.id}`);
        return next(createError(404, "Todo not found"));
      }
      logger.info(`Fetched todo: ${req.params.id}`);
      res.json(todo);
    } catch (err) {
      logger.error("Failed to fetch todo", { error: err });
      next(err);
    }
  });

  /**
   * POST /v1/todo
   * Creates a new todo item.
   * Validates the request body using the "todo" schema.
   */
  app.post(
    "/v1/todo",
    authenticate_user,
    getSchemaValidator("todo"),
    async (req, res, next) => {
      try {
        const newTodo = await todos.create(req.body);
        logger.info("Created new todo", newTodo);
        res.status(201).json(newTodo);
      } catch (err) {
        logger.error("Failed to create todo", { error: err });
        next(err);
      }
    }
  );

  /**
   * PUT /v1/todo/:id
   * Partially updates an existing todo item by ID.
   * Validates the request body using the "todo" schema in "partial" mode.
   */
  app.put(
    "/v1/todo/:id",
    authenticate_user,
    getSchemaValidator("todo", "partial"),
    async (req, res, next) => {
      try {
        const success = await todos.update(req.params.id, req.body);
        if (!success) {
          logger.warn(`Todo not found or not modified: ${req.params.id}`);
          return next(createError(404, "Todo not found or not modified"));
        }
        logger.info(`Updated todo: ${req.params.id}`);
        res.sendStatus(204);
      } catch (err) {
        logger.error("Failed to update todo", { error: err });
        next(err);
      }
    }
  );

  /**
   * DELETE /v1/todo/:id
   * Deletes a todo item by ID.
   */
  app.delete("/v1/todo/:id", authenticate_user, async (req, res, next) => {
    try {
      const success = await todos.delete(req.params.id);
      if (!success) {
        logger.warn(`Todo not found: ${req.params.id}`);
        return next(createError(404, "Todo not found"));
      }
      logger.info(`Deleted todo: ${req.params.id}`);
      res.sendStatus(204);
    } catch (err) {
      logger.error("Failed to delete todo", { error: err });
      next(err);
    }
  });
};
