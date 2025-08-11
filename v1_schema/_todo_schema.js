/**
 * @fileoverview JSON Schema definition for a "todo" object.
 * Used for validating incoming request bodies to ensure they
 * match the expected structure and data types.
 *
 * @type {import('ajv').JSONSchemaType<Object>}
 */
const schema = {
  type: "object",
  required: ["task", "priority", "assigned_to", "is_complete"],
  properties: {
    /** Description of the task. */
    task: { type: "string" },

    /** Priority level of the task (numeric scale). */
    priority: { type: "number" },

    /** Name or identifier of the person assigned to the task. */
    assigned_to: { type: "string" },

    /** Completion status of the task. */
    is_complete: { type: "boolean" },
  },

  /** Disallow properties other than those defined above. */
  additionalProperties: false,
};

module.exports = schema;
