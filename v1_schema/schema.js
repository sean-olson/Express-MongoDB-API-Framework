/**
 * @fileoverview Aggregates and exports all JSON Schemas used for validation.
 * Each schema is stored in a separate file and imported here for centralized access.
 *
 * @type {Object<string, import('ajv').JSONSchemaType<Object>>}
 */
const schema = {
    /** JSON Schema for a "todo" object. */
    todo: require("./_todo_schema"),
};

module.exports = schema;
