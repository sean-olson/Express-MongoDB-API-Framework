/**
 * @fileoverview Core Express application setup.
 * Configures security (Helmet), CORS, rate limiting, request parsing, view engine,
 * static assets, route registration, 404 handling, and a central error handler.
 */

const createError = require("http-errors");
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const logger = require("./lib/utilities/logger");
const env = require("./lib/environment/environment");
const { getErrorTemplateParams } = require("./lib/utilities/error_utils");

/** @type {import('express').Express} */
const app = express();

/**
 * Apply security-related HTTP headers via Helmet.
 * Includes:
 * - HSTS (1 year, include subdomains, preload)
 * - Cross-Origin Resource Policy (same-origin)
 * - Referrer Policy (no-referrer)
 * - Permitted Cross-Domain Policies (none)
 * - Frameguard (deny)
 */
app.use(helmet());
app.use(helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true
}));
app.use(helmet.crossOriginResourcePolicy({ policy: "same-origin" }));
app.use(helmet.referrerPolicy({ policy: "no-referrer" }));
app.use(helmet.permittedCrossDomainPolicies({ policy: "none" }));
app.use(helmet.frameguard({ action: "deny" }));

/**
 * @constant {import('cors').CorsOptions}
 * CORS configuration for non-development environments.
 */
const corsOptions = {
  origin: ["https://your-frontend.com"], // TODO: Replace with actual frontend(s)
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
};

/** 
 * Enable open CORS in development mode else use corsOptions
 */
if (env.environment === "development") {
  app.use(cors());
  logger.info("CORS enabled for all origins (development mode)");
} else {
  app.use(cors(corsOptions));
}

/**
 * @constant {import('express-rate-limit').RateLimitRequestHandler}
 * Rate limiter configuration: 100 requests per 15 minutes per IP.
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

/** 
 * Enable JSON and URL-encoded request parsing, plus cookie parsing. 
 */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/**
 * View engine setup (EJS).
 * Only used if rendering HTML views; optional for API-only deployments.
 */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

/**
 * Serve static files under a versioned virtual path.
 * @constant {string} static_virtual_path
 */
const static_virtual_path = `/${env.routePrefix}`;
app.use(static_virtual_path, express.static(path.join(__dirname, "public")));

/**
 * Dynamically register service routes using require-directory's index loader.
 */
const service_routes = require(`./${env.routePrefix}_routes/index`);
for (let folder in service_routes) {
  for (let obj in service_routes[folder]) {
    if (typeof service_routes[folder][obj] === "function") {
      service_routes[folder][obj](app);
    }
  }
}

/**
 * 404 handler.
 * Forwards an HTTP 404 error to the central error handler.
 */
app.use((req, res, next) => {
  next(createError(404));
});

/**
 * Central error handler.
 * - Responds with JSON if client accepts "application/json".
 * - Otherwise renders an HTML error page via EJS.
 * - In production, hides stack trace in HTML.
 *
 * @param {import('http-errors').HttpError & Error} err - The error object.
 * @param {import('express').Request} req - The HTTP request.
 * @param {import('express').Response} res - The HTTP response.
 * @param {import('express').NextFunction} next - The next middleware.
 */
app.use((err, req, res, next) => {
  if (req.accepts("json")) {
    res.status(err.status || 500);
    res.json({
      error: {
        message: err.message,
        ...(req.app.get("env") === "development" && { stack: err.stack })
      }
    });
  } else {
    let error;
    if (env.environment === "development") {
      error = err;
    } else {
      error = new Error("Your request is in error.");
      error.stack = [];
    }

    const template_params = getErrorTemplateParams(error, req);
    res.status(err.status || 500).render("error", template_params);
  }
});

module.exports = app;
