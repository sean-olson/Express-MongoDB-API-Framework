/**
 * @fileoverview Route for testing the HTML error reporting system.
 * In development and test environments, renders the error page template
 * with mock error data. In other environments, responds with a 404.
 */

const createError = require("http-errors");
const env = require("../../lib/environment/environment");
const { getErrorTemplateParams } = require("../../lib/utilities/error_utils");

/**
 * Registers the `/v1/error_test` route for testing error page rendering.
 *
 * @param {import('express').Express} app - The Express application instance.
 */
module.exports = (app) => {
    /**
     * GET /v1/error_test
     *
     * In `development` or `test` environments:
     * - Creates a mock error object
     * - Generates template parameters for the error page
     * - Responds with a rendered error view and HTTP 200
     *
     * In all other environments:
     * - Responds with 404 Not Found
     *
     * @name ErrorTest
     * @function
     * @memberof module:error_test_route
     * @inner
     *
     * @param {import('express').Request} req - The HTTP request object.
     * @param {import('express').Response} res - The HTTP response object.
     * @param {import('express').NextFunction} next - The next middleware function.
     */
    app.get(`/v1/error_test/`, (req, res, next) => {
        try {
            if (env.environment === "development" || env.environment === "test") {
                const error = new Error("This is a test of the error reporting system.");
                error.status = "500";
                const template_params = getErrorTemplateParams(error, req);
                res.status(200).render("error", template_params);
            } else {
                next(createError(404));
            }
        } catch (err) {
            next(err);
        }
    });
};
