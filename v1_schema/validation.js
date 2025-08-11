/**
 * @fileoverview AJV-based request body validation utilities.
 * Exposes a factory that returns Express middleware to validate request bodies
 * against JSON Schemas, supporting "strict" and "partial" modes.
 */

const createError = require("http-errors");
const logger = require("../lib/utilities/logger");
const Ajv = require("ajv");

const schema = require("./schema");
/** @type {Ajv} */
const ajv = new Ajv({ allErrors: true, coerceTypes: true, useDefaults: true });

/**
 * Returns an Express middleware that validates `req.body` against a named schema.
 *
 * Modes:
 * - "strict" (default): requires all fields specified in the schema's `required` array.
 * - "partial": removes `required` to allow partial updates while still enforcing types and allowed properties.
 *
 * @function getSchemaValidator
 * @param {keyof typeof schema} schemaType - The key of the schema to use (e.g., "todo").
 * @param {"strict"|"partial"} [mode="strict"] - Validation mode.
 * @returns {import('express').RequestHandler} Express middleware that validates the request body.
 */
function getSchemaValidator(schemaType, mode = "strict") {
  if (!Object.hasOwn(schema, schemaType)) {
    return (req, res, next) => {
      next(createError(422, "Unknown schema type"));
    };
  }

  /** @type {object} */
  const baseSchema = schema[schemaType];
  /** @type {object} A deep-cloned schema to avoid mutation side-effects. */
  const schemaCopy = JSON.parse(JSON.stringify(baseSchema)); // deep clone to avoid mutation

  if (mode === "partial") {
    delete schemaCopy.required; // allow partial updates
  }

  /** @type {(data: any) => boolean} */
  const validate = ajv.compile(schemaCopy);

  return (req, res, next) => {
    const isValid = validate(req.body);
    if (!isValid) {
      const message = ajv.errorsText(validate.errors);
      logger.warn(`Validation failed for ${schemaType} (${mode})`, { errors: validate.errors });
      return next(createError(422, message));
    }
    next();
  };
}

module.exports = {
  getSchemaValidator
};
