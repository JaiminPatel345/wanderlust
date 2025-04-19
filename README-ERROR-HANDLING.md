# Error Handling System for Wanderlust

This document describes the improved error handling system implemented in the Wanderlust application.

## Backend Components

### 1. AppError Class

The `AppError` class extends JavaScript's native `Error` class to provide better error handling. It includes:
- `statusCode`: HTTP status code associated with the error
- `status`: Either "fail" (4xx) or "error" (5xx), based on the status code
- `isOperational`: Indicates whether this is an operational error

### 2. Error Handler Utility

The `errorHandler.js` utility provides a centralized way to handle different types of errors:

- **Application errors** (AppError instances)
- **Database errors**:
  - MongoDB duplicate key errors
  - Mongoose validation errors
  - Mongoose CastErrors
- **Authentication errors**:
  - JWT errors
  - Token expiration errors
- **External service errors**:
  - Redis errors

### 3. Response Formatter

The `formatResponse` function provides consistent response formatting:
```js
{
  success: boolean,
  message: string,
  data?: any
}
```

### 4. AsyncWrap Utility

The `asyncWrap` function now uses the error handler to catch and process errors in async route handlers, eliminating the need for try/catch blocks in controllers.

## Improvements Made

1. **Standardized Error Handling**: All controllers now use a consistent approach with AppError.

2. **Cleaner Controller Code**: Removed try/catch blocks from controllers, making them more readable and focused on business logic.

3. **Better Error Information**: Error responses now include meaningful messages and appropriate status codes.

4. **Specialized Error Handling**: Different types of errors (database, authentication, etc.) are handled specifically.

5. **Security Improvement**: Error details in production are limited to prevent information leakage.

## Frontend Improvements

1. **API Utility**: Created a centralized API utility with methods:
   - `handleApiResponse`: Processes API responses, checking for errors
   - `apiRequest`: Base request function with error handling
   - `post`, `get`, `put`, `del`: Convenience methods for different HTTP methods

2. **Consistent Error Handling**: All API calls now use a standardized approach for error handling.

3. **User Context**: Updated to handle the new response format.

## Usage Examples

### Backend: Throwing AppErrors

```js
if (!email) {
  throw new AppError("Email is required", 400);
}
```

### Frontend: Using API Utilities

```js
try {
  const response = await post("/login", formData);
  // Handle successful response
} catch (error) {
  // Handle error (error.message will contain the error message)
}
```

## Dependencies

No additional dependencies were added for this implementation. 