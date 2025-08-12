# Express–MongoDB API Framework

A secure, light-weight, production-ready Node.js API framework built with [Express](https://expressjs.com/), [MongoDB](https://www.mongodb.com/), and [AJV](https://ajv.js.org/) for JSON schema validation.  
This project is designed to serve as a **reusable starting point** for creating RESTful APIs, with built-in best practices for security, request validation, error handling, and environment configuration.  It is built upon the foundational architecture provided by the official Express.js generator, with thanks to the Express team for their excellent scaffolding tool.

---

## Features

- **Express.js** – Fast, unopinionated, minimalist web framework.
- **MongoDB Integration** – Centralized singleton connection for re-use across modules.
- **Environment Configuration** – Strongly typed getters for all env variables.
- **Security Best Practices**:
  - [Helmet](https://helmetjs.github.io/) for HTTP header hardening
  - CORS configuration
  - Rate limiting
- **Error Handling**:
  - Centralized error handler (JSON or HTML output depending on `Accept` header)
  - Utility helpers for creating and handling HTTP errors
- **AJV Validation** – Schema-based request validation with support for strict and partial modes.
- **Logging** – Winston-based logging with separate dev/prod configurations.
- **Modular Routes** – Auto-loading of routes by directory.
- **Unit Testing** – [Jest](https://jestjs.io/) test runner with Supertest for endpoint testing.

---

## Project Structure

```
.
├── /__tests__
│   ├── diagnostic.routes.test.js
│   ├── html.routes.test.js
│   ├── todo.routes.test.js
│   ├── todo.validation.routes.test.js
│   └── todo.notfound.routes.test.js
├── /bin
│   └── www
├── /lib
│   ├── /auth
│   │   └── authenticate_user.js
│   ├── /data
│   │   └── db.js
│   ├── /environment
│   │   └── environment.js
│   ├── /utilities
│   │   ├── error_utils.js
│   │   ├── logger.js
│   │   └── mongo_utils.js
├── /logs
│   ├── combined.log
│   ├── error.js
├── v1_routes
│   ├── index.js
│   ├── diagnostic_routes
│   │   └── diagnostic_routes_index.js
│   ├── html_routes
│   │   └── html_routes_index.js
│   ├── todo_demo_routes
│   │   ├── todo_demo_module.js
│   │   └── todo_demo_routes_index.js
├── /v1_schema
│   ├── _todo_schema.js
│   ├── schema.js
│   └── validation.js
├── /views                     # EJS templates (optional)
├── /public                    # Static assets
├── .env_template              # Environment variables template
├── app.js                     # Main Express app configuration
├── jest.setup.js              # Jest test environment setup
├── package.json
└── README.md
```

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/sean-olson/Express-MongoDB-API-Framework.git
cd express-mongo-api-scaffold
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
This project includes a .env_template file containing all required environment variables.
You must **copy and rename** this file to .env, then adjust the values for your local or production environment.

#### 1. Copy the template to a new .env file in the project root:

```
cp .env_template .env
```
#### 2. Edit the .env file and update values as needed:

| Variable       | Description                                                       | Example Value                   |
| -------------- | ----------------------------------------------------------------- | ------------------------------- |
| `SERVICE_NAME` | Human-readable name for your service (used in logs and templates) | `"Express-Mongo API Framework"` |
| `NODE_ENV`     | Runtime environment (`development`, `production`, `test`)         | `"development"`                 |
| `HTTP_PORT`    | HTTP port (used if `USE_SSL=false`)                               | `3000`                          |
| `HTTPS_PORT`   | HTTPS port (used if `USE_SSL=true`)                               | `3443`                          |
| `USE_SSL`      | Whether to use HTTPS (`true` or `false`)                          | `false`                         |
| `SERVICE_URL`  | Public-facing hostname (used in templates, logs)                  | `"localhost"`                   |
| `VERSION`      | API version prefix                                                | `"v1"`                          |
| `DB_URI`       | MongoDB connection URI (include credentials if required)          | `"mongodb://localhost:27017"`   |
| `DB_NAME`      | MongoDB database name                                             | `"scaffold_demo"`               |
| `USER_NAME`    | Optional MongoDB username (only for secured DBs)                  | `""`                            |
| `PASSWORD`     | Optional MongoDB password (only for secured DBs)                  | `""`                            |

### 4. Create Log Files
The framework is configured to work with Winston file transports out of the box.  Just create a logs directory at the root of the project, `mkdir logs`, and then create the two transport log files, `touch ./logs/combined.log ./logs/error.log`.

**Note:** Never commit your .env file to version control — it may contain sensitive credentials.

### 5. Start the Development Server
```bash
npm run dev
```

### 6. Start in Production
```bash
npm start
```

---

## Available Endpoints

### Health Check
```http
GET /v1/health_check
```
- **200** if MongoDB is reachable
- **503** if database is unavailable

### Error Test (Development/Test Only)
```http
GET /v1/error_test
GET /v1/throw_error
```

### Authentication Test (Development/Test Only)
```http
GET /v1/auth_test
```

### Todo Demo Routes
```http
GET    /v1/todo
GET    /v1/todo/:id
POST   /v1/todo
PUT    /v1/todo/:id
DELETE /v1/todo/:id
```
- **Validation:** Requests are validated against the `todo` JSON schema.

---

## Testing

Run all Jest tests:
```bash
npm test
```

Run with coverage:
```bash
npm run test:coverage
```

---

## Scripts

| Script            | Description                                      |
|-------------------|--------------------------------------------------|
| `npm start`       | Start production server                          |
| `npm run dev`     | Start server with `nodemon` for development      |
| `npm test`        | Run Jest test suite                              |
| `npm run lint`    | Lint codebase (if ESLint configured)             |

---

## Security Considerations

- Ensure **CORS origin** in `app.js` is updated to your real frontend URL.
- If enabling HTTPS (`USE_SSL=true`), place `key.pem` and `cert.pem` in the project root.
- In production, logging writes to `logs/error.log` and `logs/combined.log`.

---

## License

This project is provided under the [MIT License](LICENSE).

---

