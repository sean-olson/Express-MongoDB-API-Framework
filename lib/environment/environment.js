/**
 * @fileoverview Singleton environment configuration class.
 * Provides strongly typed accessors for environment variables with sensible defaults.
 * Ensures consistent configuration handling across the application.
 */

const path = require("path");

/**
 * @class Env
 * @classdesc Provides getters for all relevant environment variables,
 * returning defaults when variables are unset.
 */
class Env {
  /**
   * Gets the human-readable service name.
   * @returns {string} Service name or `"API"` if not defined.
   */
  get serviceName() {
    return process.env.SERVICE_NAME || "API";
  }

  /**
   * Gets the runtime environment (e.g., `"development"`, `"production"`, `"test"`).
   * @returns {string} Environment name or `"production"` if not defined.
   */
  get environment() {
    return process.env.NODE_ENV || "production";
  }

  /**
   * Gets the HTTP port number.
   * @returns {number} Port number or `3000` if not defined.
   */
  get httpPort() {
    return parseInt(process.env.HTTP_PORT) || 3000;
  }

  /**
   * Gets the HTTPS port number.
   * @returns {number} Port number or `4443` if not defined.
   */
  get httpsPort() {
    return parseInt(process.env.HTTPS_PORT) || 4443;
  }

  /**
   * Checks if HTTPS is enabled.
   * @returns {boolean} `true` if `USE_SSL` is set to `"true"`, otherwise `false`.
   */
  get useSSL() {
    return process.env.USE_SSL === "true";
  }

  /**
   * Gets the public base URL of the service.
   * @returns {string} URL string or empty string if not defined.
   */
  get serviceUrl() {
    return process.env.SERVICE_URL || "";
  }

  /**
   * Gets the API version prefix.
   * @returns {string} Lowercase version string or `"v1"` if not defined.
   */
  get routePrefix() {
    return (process.env.VERSION || "v1").toLowerCase();
  }

  // ────── Database Properties ──────

  /**
   * Gets the MongoDB host or connection URL.
   * @returns {string} Database host or `"localhost"` if not defined.
   */
  get dbUrl() {
    return process.env.DB_URL || "localhost";
  }

  /**
   * Gets the MongoDB port number.
   * @returns {string} Port string or `"27017"` if not defined.
   */
  get dbPort() {
    return process.env.DB_PORT || "27017";
  }

  /**
   * Gets the MongoDB database name.
   * @returns {string} Database name or `"test"` if not defined.
   */
  get dbName() {
    return process.env.DB_NAME || "test";
  }

  /**
   * Gets the MongoDB username.
   * @returns {string} Username or empty string if not defined.
   */
  get dbUsername() {
    return process.env.DB_USER_NAME || "";
  }

  /**
   * Gets the MongoDB password.
   * @returns {string} Password or empty string if not defined.
   */
  get dbPassword() {
    return process.env.DB_PASSWORD || "";
  }

  // ────── Filesystem Paths ──────

  /**
   * Gets the absolute path to the log directory.
   * @returns {string} Absolute path to the logs directory.
   */
  get logDir() {
    return path.resolve(__dirname, "../../logs");
  }
}

/**
 * Singleton instance of the Env class.
 * @type {Env}
 */
module.exports = new Env();
