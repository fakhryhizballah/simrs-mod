# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SIMRS-MOD is a Node.js/Express backend application for an Indonesian hospital management system. It uses MongoDB via Mongoose ORM and connects to external APIs for authentication and user data verification. The application runs on port 3000 (default) and serves EJS templates with static assets.

## Commands That Work Well Here

### Development & Build

```bash
# Start the development server
node index.js

# Run tests (currently empty - add Jest/MoCha later)
npm test

# Install dependencies
npm install

# Run with PM2 in background
pm2 start ecosystem.config.js

# Stop PM2 processes
pm2 stop all
```

### Running Tests

Current state: No test framework is configured. Add Jest for unit tests or MoCha for CLI-style testing once tests are implemented.

## Codebase Architecture

### Application Structure

```
simrs-mod/
├── controllers/          # Route handlers and business logic
│   ├── index.js         # Main controller (login, menu, AJAX handlers)
│   └── ajax.js          # AJAX request handlers for login form submission
├── modelsMongoose/       # Mongoose ORM schemas
│   ├── Users.js         # User schema with username/password/akses/data
│   └── Menus.js         # Menu hierarchy schema with hak_akses
├── middleware/           # Express middleware (JWT auth check)
│   └── index.js         # JWT verification and API URL cookie setting
├── routes/              # Express route definitions
│   └── index.js         # Route mappings for REST endpoints
├── views/               # EJS templates directory
│   ├── auth/           # Authentication pages (login)
│   ├── dashboard/       # Main dashboard and reports pages
│   ├── layouts/         # Base layout template with header/footer
│   └── partials/        # Reusable view components
├── public/              # Static assets served by Express
│   ├── asset/           # Organized static resources
│   │   ├── css/         # Stylesheets
│   │   ├── img/         # Images
│   │   └── js/          # Client-side JavaScript
├── index.js             # Application entry point (Express app config)
├── ecosystem.config.js   # PM2 process manager configuration
└── .env                 # Environment configuration (credentials not included)
```

### Key Files Explained

**index.js** - Application bootstrapper:
- Initializes Express with body-parser, cookie-parser, morgan logging
- Sets up static file serving for public assets (css, js, img)
- Connects to MongoDB via Mongoose connection pool
- Mounts routes from `routes/` and makes `mongoose` available globally

**controllers/index.js** - Primary HTTP handlers:
- Uses nested render pattern for EJS layouts: renders child view → stores in `data.body` → re-renders parent layout
- Key functions: `login()`, `dashboard()`, `menu()`, AJAX paginated menu fetching
- Implements hierarchical menu filtering via Mongoose aggregation pipelines based on user access level

**controllers/ajax.js** - API form submission handler:
- Handles POST /login from login forms
- Validates credentials against local users table first
- Calls external KHNZA API for password verification and access rights
- Creates/updates users in MongoDB with JWT token generation (1 day expiry)

**middleware/index.js** - Authentication middleware:
- Verifies JWT token from cookies
- Validates token against SECRET_KHNZA key
- Sets API_URL cookie for future requests to external services

**modelsMongoose/** - Data schemas:
- `Users`: Simple schema with username, password, akses (role mapping), data (user profile)
- `Menus`: Hierarchical menu structure using hak_akses as unique identifier
- Note: `{ strict: false }` allows MongoDB document fields beyond schema definition

### Environment Variables

Required from `.env`:
```bash
MONGO_URI=mongodb://localhost:27017/simrs
SECRET_KHNZA=<JWT signing secret>
HOSTKHNZA=<external-api-url>
PORT=3000
```

## Security Considerations

**Important**: The codebase contains hardcoded security issues that must be addressed:

1. **CVE-2022-29654 (Node.js SSRFI vulnerability)** - `httpsAgent` with `rejectUnauthorized: false` in `controllers/ajax.js` enables unauthenticated SSRFI attacks
   - Recommendation: Remove `rejectUnauthorized: false` or use a dedicated proxy service

2. **JWT Security**: Secrets loaded from potentially insecure file paths
   - Store secrets outside web-accessible directories
   - Use environment variables properly

3. **Sensitive Data in .env files** - Do not commit `.env` files with credentials

## Common Development Tasks

### Adding New Routes

```bash
# In routes/index.js:
router.get('/new-endpoint', middleware.auth, controller.newHandler);

# Implement in controllers/index.js:
module.exports = {
    // ... existing handlers
    newEndpoint: (req, res) => { /* handler code */ }
};
```

### Adding Static Assets

1. Create directory under `public/asset/<type>/`
2. The file is automatically served by Express configuration in `index.js`

### Working with Templates

EJS rendering flow:
1. Controller calls `res.render("view/file", data)`
2. Child view renders → content stored in `data.body`
3. Parent layout re-renders with body content

## Docker Development

```bash
# Build image
docker build -t simrs-mod .

# Run container with PM2 runtime
docker run --rm -p 3000:3000 simrs-mod

# Or use docker-compose directly from docker-compose.yml
docker compose up --build
```

## Database Schema Notes

- `{ strict: false }` in schemas allows MongoDB to store fields beyond schema definition
- User documents contain nested `akses` (role mappings) and `data` (user profile) arrays/objects
- Menu hierarchy uses string keys as identifiers with parent-child relationships
