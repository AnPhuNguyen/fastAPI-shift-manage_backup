# Login Authentication API Documentation

## Overview
This API provides a login authentication system using FastAPI and JWT (JSON Web Tokens). It allows users to log in with a username and password, receive a JWT access token, and access protected endpoints using the token for authentication.

## Features
- User login with username and password
- JWT token generation with expiration
- Token validation and user identification
- CORS enabled for all origins
- Static file serving for frontend assets

## Endpoints

### POST /login
Authenticate a user and return a JWT access token.

- **Request Body:**
  ```json
  {
    "user_name": "string",
    "password": "string"
  }
  ```

- **Response:**
  ```json
  {
    "access_token": "string",
    "token_type": "bearer"
  }
  ```

- **Errors:**
  - 400: Invalid username or password

### GET /user/me
Get the current authenticated user's information.

- **Headers:**
  - Authorization: Bearer `<access_token>`

- **Response:**
  - User information as defined by the `userOut` model

- **Errors:**
  - 401: Token expired or invalid
  - 400: User not found

## Authentication Flow

1. User submits login credentials to `/login`.
2. Server verifies credentials against the database.
3. If valid, server creates a JWT token with an expiration time.
4. Token is returned to the client.
5. Client stores the token (e.g., in localStorage).
6. Client includes the token in the Authorization header for protected endpoints.
7. Server validates the token and extracts user info on each request.

## JWT Token Details

- Algorithm: HS256
- Secret Key: Configurable (default: "newbie")
- Expiration: 30 minutes by default

## Frontend Integration

- Static files are served from the `/static` URL path.
- Login page (`index.html`) includes JavaScript to handle login and token storage.
- Success page (`success.html`) checks for token presence and allows logout.
- JavaScript files (`login.js` and `success.js`) handle session persistence and redirection.

## CORS Configuration

- CORS middleware allows all origins, credentials, methods, and headers.

## Notes

- Ensure the secret key is kept secure and changed in production.
- Token expiration is enforced; expired tokens result in 401 errors.
- Frontend should handle token storage securely and clear tokens on logout.

## Running the API

- Run the FastAPI app as usual (e.g., `uvicorn main:app --reload`).
- Access the login page at the root URL (`/`).
- Static assets are available under `/static`.
