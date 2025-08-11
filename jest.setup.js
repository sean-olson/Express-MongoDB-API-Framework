/**
 * @fileoverview Jest setup file to initialize environment variables for testing.
 * Ensures the `.env` file is loaded and forces `NODE_ENV` to "test" before any tests run.
 */

require("dotenv").config();
process.env.NODE_ENV = "test";
