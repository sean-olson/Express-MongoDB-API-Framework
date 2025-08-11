/**
 * @fileoverview Provides stub authentication middleware for Express.
 * This middleware simulates a successfully authenticated user by attaching
 * a placeholder user object to the `req` object. Replace with a real
 * authentication mechanism (e.g., JWT verification) in production.
 */

const logger = require("../utilities/logger");

/**
 * Simulated authentication middleware.
 *
 * @function authenticate_user
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {void}
 *
 * @example
 * app.get('/secure', authenticate_user, (req, res) => {
 *   res.json({ user: req.user });
 * });
 *
 * @description
 * - Attaches a simulated user object to `req.user`.
 * - Logs the simulated authentication event.
 * - To simulate unauthorized access, uncomment the provided return statement.
 */
function authenticate_user(req, res, next) {
  req.user = {
    id: "placeholder-user-id",
    username: "stub_user",
    roles: ["user"], // Extend with role-based logic if needed
  };

  logger.info(`authenticated user`, { id: req.user.id });

  // Uncomment to simulate an unauthorized request:
  // return res.status(401).json({ error: "Unauthorized" });

  next();
}

module.exports = {
  authenticate_user
};
