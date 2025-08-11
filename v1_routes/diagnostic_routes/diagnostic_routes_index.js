/**
 * @fileoverview Diagnostic routes for application health and error testing.
 * Includes:
 * - Health check endpoint for database connectivity
 * - Simulated runtime error for testing the central error handler
 * - Authentication test endpoint for verifying middleware integration
 */

const env = require("../../lib/environment/environment");
const { authenticate_user } = require("../../lib/auth/authenticate_user");
const db = require('../../lib/data/db');

/**
 * Registers diagnostic endpoints to the provided Express application instance.
 *
 * @param {import('express').Express} app - The Express application instance.
 */
module.exports = (app) => {
    /**
     * GET /v1/health_check
     *
     * Pulse check endpoint that verifies database connectivity.
     * Responds with:
     * - 200 OK if MongoDB responds to a ping
     * - 503 Service Unavailable if the database is unreachable
     *
     * @name HealthCheck
     * @function
     * @memberof module:diagnostic_routes
     * @inner
     */
    app.get('/v1/health_check', async (req, res) => {
        try {
            await db._db.command({ ping: 1 });
            res.sendStatus(200);
        } catch (err) {
            res.sendStatus(503);
        }
    });

    /**
     * GET /v1/throw_error
     *
     * Simulates a runtime error to test the central error handler.
     * Only available in `development` and `test` environments; otherwise responds with 404.
     *
     * @name ThrowErrorTest
     * @function
     * @memberof module:diagnostic_routes
     * @inner
     */
    app.get("/v1/throw_error", (req, res, next) => {
        if (env.environment !== "development" && env.environment !== "test") {
            return res.sendStatus(404);
        }
        throw new Error("💥 Uncaught test exception from /v1/throw_error");
    });

    /**
     * GET /v1/auth_test
     *
     * Tests authentication middleware and returns the authenticated user object.
     * Only available in `development` and `test` environments; otherwise responds with 404.
     *
     * @name AuthTest
     * @function
     * @memberof module:diagnostic_routes
     * @inner
     *
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @param {import('express').NextFunction} next - The next middleware function.
     */
    app.get("/v1/auth_test", authenticate_user, (req, res, next) => {
        if (env.environment !== "development" && env.environment !== "test") {
            return res.sendStatus(404);
        }
        res.status(200).json({ authenticated_user: req.user });
    });
};
