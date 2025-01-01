# Express API Coding Standards

This document outlines the coding standards and best practices for building REST APIs with Express.js in this project. Following these standards ensures consistency, maintainability, and scalability of our APIs.

## Table of Contents

1. [Project Structure](#project-structure)
2. [API Design Principles](#api-design-principles)
3. [Error Handling](#error-handling)
4. [Security](#security)
5. [Performance](#performance)
6. [Documentation](#documentation)
7. [Testing](#testing)

## Project Structure

### Directory Layout

```
src/
├── index.ts                 # Application entry point
├── routes/                  # Route definitions
│   ├── index.ts            # Route aggregator
│   └── entity/             # Entity-specific routes
├── controllers/            # Request handlers
│   └── entity/            # Entity-specific controllers
├── services/              # Business logic
│   └── entity/           # Entity-specific services
├── models/               # Data models
│   └── entity/          # Entity-specific models
├── middleware/          # Custom middleware
├── utils/              # Utility functions
└── types/             # TypeScript type definitions
```

### Three-Layer Architecture

1. **Web Layer (Controllers & Routes)**

   - Handles HTTP requests/responses
   - Input validation
   - Route definitions
   - No business logic

2. **Service Layer**

   - Contains business logic
   - Orchestrates data access
   - Independent of HTTP context

3. **Data Access Layer**
   - Database interactions
   - Data models
   - Query operations

## API Design Principles

### URL Structure

- Use plural nouns for resources
- Use kebab-case for URLs
- Nest related resources

```typescript
// Good
GET /api/v1/users
GET /api/v1/users/:userId/orders

// Bad
GET /api/v1/getUser
GET /api/v1/user-get
```

### HTTP Methods

Use appropriate HTTP methods:

- GET: Retrieve resources
- POST: Create resources
- PUT: Update entire resources
- PATCH: Partial updates
- DELETE: Remove resources

### Request/Response Format

```typescript
// Success Response
{
  "status": "success",
  "data": {
    // Response data
  }
}

// Error Response
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### Versioning

- Include version in URL path
- Start with v1

```typescript
app.use("/api/v1/users", userRoutes);
```

## Error Handling

### HTTP Status Codes

Use appropriate status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

### Error Handler Implementation

```typescript
// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({
    status: "error",
    error: {
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
});
```

### Custom Error Classes

```typescript
class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = "APIError";
  }
}
```

## Security

### Authentication & Authorization

- Use JWT for stateless authentication
- Implement role-based access control
- Store sensitive data in environment variables

### Middleware Security

```typescript
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);
```

### Input Validation

Use a validation library (e.g., express-validator):

```typescript
import { body, validationResult } from "express-validator";

const validateUser = [
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
```

## Performance

### Caching

Implement appropriate caching strategies:

```typescript
import apicache from "apicache";

// Cache successful GET requests for 15 minutes
app.use(apicache.middleware("15 minutes"));
```

### Database Optimization

- Use indexes appropriately
- Implement pagination
- Optimize queries

### Request Handling

```typescript
// Pagination example
router.get("/users", async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const users = await User.find().skip(skip).limit(limit);

  res.json({
    status: "success",
    data: users,
    pagination: {
      page,
      limit,
      total: await User.countDocuments(),
    },
  });
});
```

## Documentation

### API Documentation

Use OpenAPI/Swagger for API documentation:

```typescript
/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Retrieve users
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of users
 */
```

### Code Documentation

- Use JSDoc for function documentation
- Document complex business logic
- Include examples for non-obvious implementations

## Testing

### Unit Tests

```typescript
describe("UserService", () => {
  it("should create a new user", async () => {
    const userData = {
      email: "test@example.com",
      password: "password123",
    };
    const user = await UserService.create(userData);
    expect(user).toHaveProperty("id");
    expect(user.email).toBe(userData.email);
  });
});
```

### Integration Tests

```typescript
describe("User API", () => {
  it("should return 401 for unauthorized access", async () => {
    const response = await request(app)
      .get("/api/v1/users")
      .set("Accept", "application/json");

    expect(response.status).toBe(401);
  });
});
```

### API Testing

- Use Postman/Newman for API testing
- Maintain collection of API tests
- Include environment-specific configurations

## Additional Guidelines

1. **Dependency Management**

   - Keep dependencies up to date
   - Use exact versions in package.json
   - Regularly audit dependencies for security

2. **Code Quality**

   - Use ESLint for code linting
   - Implement pre-commit hooks
   - Follow TypeScript best practices

3. **Logging**

   - Implement structured logging
   - Use appropriate log levels
   - Include request correlation IDs

4. **Configuration**

   - Use environment variables for configuration
   - Implement configuration validation
   - Maintain separate configs for different environments

5. **Monitoring**
   - Implement health checks
   - Monitor API metrics
   - Set up error tracking

## ERROR Handling Examples

When displaying error or status the following is a working example of an error case

res.status(500).json({ error: "Something went wrong!" });

```
app.use((err: Error, _req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});
```

Here is another example of returning a 400 status with error code

```

  // Validate request body
  if (!name || !description) {
    return res.status(400).json({ error: "Name and description are required" });
  }
```

Here is success example

```
  res.status(201).json(newItem);
```

IMPORTANT. ALWAYS USE
res.status(XXX).json() when responding

Never use

```
    res.json({
      status: "success",
      data: response.data
    });
```

As you are not setting a status

Remember: These standards are guidelines, not rigid rules. Use judgment to determine when to deviate based on specific requirements or constraints.
