/**
 * @fileoverview Aggregates and exports all modules in the current directory
 * using the `require-directory` package.
 *
 * This allows requiring this file to automatically load all route/controller
 * modules in the directory without manually listing them.
 *
 * @example
 * // index.js in a routes folder
 * const routes = require('./');
 * routes.someRoute(app);
 */
module.exports = require("require-directory")(module);
