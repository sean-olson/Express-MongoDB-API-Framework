/**
 * @fileoverview Utility functions for standardized error handling in Express applications.
 * Includes:
 * - Async route handler wrapper
 * - API error creation helper
 * - Conditional validation with error throwing
 * - Error template parameter generator for HTML views
 */

const createError = require("http-errors");
const env = require("../environment/environment");

/**
 * Wraps an async Express route handler to catch and forward errors.
 *
 * @function asyncHandler
 * @param {Function} fn - The async route handler function.
 * @returns {import('express').RequestHandler} Express middleware that wraps the handler.
 *
 * @example
 * app.get('/example', asyncHandler(async (req, res) => {
 *   const data = await fetchData();
 *   res.json(data);
 * }));
 */
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Creates an HTTP error object with a status and message.
 *
 * @function createApiError
 * @param {number} status - HTTP status code.
 * @param {string} message - Error message.
 * @param {Error|null} [innerError=null] - Optional inner error for debugging.
 * @returns {import('http-errors').HttpError} The created HTTP error object.
 *
 * @example
 * throw createApiError(404, 'Resource not found');
 */
function createApiError(status, message, innerError = null) {
  const err = createError(status, message);
  if (innerError) err.inner = innerError;
  return err;
}

/**
 * Validates a condition and throws an HTTP error if it fails.
 *
 * @function requireCondition
 * @param {boolean} condition - Condition to check.
 * @param {number} status - HTTP status code to throw if condition fails.
 * @param {string} message - Error message for the thrown error.
 * @throws {import('http-errors').HttpError} If the condition is false.
 *
 * @example
 * requireCondition(user.isActive, 403, 'User account is inactive');
 */
function requireCondition(condition, status, message) {
  if (!condition) throw createApiError(status, message);
}

/**
 * Generates template parameters for rendering an HTML error page.
 *
 * @function getErrorTemplateParams
 * @param {Error & {status?: number}} err - Error object with optional status.
 * @param {import('express').Request} req - The Express request object.
 * @returns {Object} Template parameters for the HTML error page.
 *
 * @property {string} title - Title of the error page.
 * @property {number} status_code - HTTP status code.
 * @property {string} heading - Heading for the error page.
 * @property {string} request - Full request URL.
 * @property {string} message - Error message.
 * @property {string|Array} stack - Error stack trace.
 */
function getErrorTemplateParams(err, req) {
  return {
    title: `${env.serviceName} - Error`,
    status_code: err.status,
    heading: `${env.serviceName} - Error`,
    request: `${req.method} ${env.useSSL ? "https" : "http"}://${env.serviceUrl}:${env.useSSL ? env.httpsPort : env.httpPort}${req.originalUrl}`,
    message: err.message,
    stack: err.stack
  };
}

module.exports = {
  asyncHandler,
  createApiError,
  requireCondition,
  getErrorTemplateParams
};
