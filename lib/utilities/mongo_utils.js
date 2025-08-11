/**
 * @fileoverview Utility functions and Express middleware for working with MongoDB ObjectId values.
 * Includes creation, casting, and validation for both path and query parameters.
 */

const { ObjectId } = require("mongodb");

/**
 * Generates a new MongoDB ObjectId using the current Unix timestamp.
 * 
 * @returns {ObjectId} A new MongoDB ObjectId instance.
 */
function newObjectId() {
  return ObjectId.createFromTime(Math.floor(Date.now() / 1000));
}

/**
 * Casts a hexadecimal string to a MongoDB ObjectId instance.
 * 
 * @param {string} id - A valid 24-character hexadecimal string representing an ObjectId.
 * @returns {ObjectId} The corresponding MongoDB ObjectId.
 * @throws {Error} If the input is not a valid hexadecimal string.
 */
function castObjectId(id) {
  return ObjectId.createFromHexString(id);
}

/**
 * Express `app.param` handler for validating MongoDB ObjectId route parameters.
 * 
 * This function is intended to be used with `app.param(paramName, handler)` so that
 * any route containing the specified parameter will automatically validate that the
 * value is a valid MongoDB ObjectId.
 * 
 * If the value is invalid, responds with `400 Bad Request` and does not proceed
 * to the route handler.
 * 
 * @example
 * // Apply globally in app.js for all `:id` parameters
 * app.param('id', validateObjectIdParamHandler);
 * 
 * @param {import("express").Request} req - The Express request object.
 * @param {import("express").Response} res - The Express response object.
 * @param {import("express").NextFunction} next - The next middleware function.
 * @param {string} value - The actual value of the route parameter being validated.
 * @returns {void}
 */
function validateObjectIdParamHandler(req, res, next, value) {
  if (!ObjectId.isValid(value)) {
    return res.status(400).json({ error: "Invalid ObjectId" });
  }
  next();
}

module.exports = {
  newObjectId,
  castObjectId,
  validateObjectIdParamHandler
};
