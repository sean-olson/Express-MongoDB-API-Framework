/**
 * @fileoverview Winston logger configuration for the application.
 * Provides a colorized console logger for development and optional
 * file-based logging for production (non-serverless) environments.
 */

const path = require("path");
const { createLogger, format, transports } = require("winston");
const env = require("../environment/environment");

/**
 * Indicates if the current environment is production.
 * @type {boolean}
 */
const isProduction = env.environment === "production";

/**
 * Indicates if the app is running in a serverless environment (e.g., AWS Lambda).
 * @type {boolean}
 */
const isServerless = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

/**
 * Logging level to use.
 * Uses `env.logLevel` if set; otherwise defaults to:
 * - `"info"` in production
 * - `"debug"` in non-production
 * @type {string}
 */
const logLevel = env.logLevel || (isProduction ? "info" : "debug");

/**
 * Transport list for Winston logger.
 * Always includes console transport; adds file transports in production (non-serverless) mode.
 * @type {import('winston').transport[]}
 */
const loggerTransports = [
  new transports.Console()
];

if (isProduction && !isServerless) {
  loggerTransports.push(
    new transports.File({
      filename: path.join(env.logDir, "error.log"),
      level: "error"
    }),
    new transports.File({
      filename: path.join(env.logDir, "combined.log")
    })
  );
}

/**
 * Winston logger instance configured for environment.
 * - In production (non-serverless): JSON format for files, no colors.
 * - In development: colorized, timestamped console logs with printf formatting.
 *
 * @type {import('winston').Logger}
 */
const logger = createLogger({
  level: logLevel,
  format: isProduction && !isServerless
    ? format.json()
    : format.combine(
        format.colorize(),
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(({ timestamp, level, message, ...meta }) => {
          const metaString = Object.keys(meta).length
            ? JSON.stringify(meta, null, 2)
            : "";
          return `[${timestamp}] ${level}: ${message} ${metaString}`;
        })
      ),
  transports: loggerTransports,
});

module.exports = logger;
