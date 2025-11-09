# JWT Login Implementation

## Overview
This implementation adds JWT (JSON Web Token) authentication to the login functionality of the BykeStore application.

## Setup

### Install Dependencies
```bash
cd api
npm install
```

This will install the required dependencies:
- `jsonwebtoken`: For generating and verifying JWT tokens
- `bcryptjs`: For password hashing (currently not used but available for future enhancement)

## API Endpoint

### POST /api/login

Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "correo": "user@example.com",
  "contrasena": "password123"
}
```

**Success Response (200):**
```json
{
  "mensaje": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nombre": "John",
    "apellido": "Doe",
    "correo": "user@example.com"
  }
}
```

**Error Responses:**
- `400`: Missing email or password
- `401`: Invalid credentials
- `500`: Server error

## Frontend Usage

The login form (`html/login.html`) now includes JavaScript (`javascript/login.js`) that:

1. Captures form submission
2. Sends credentials to `/api/login`
3. Stores the JWT token in `localStorage`
4. Stores user information in `localStorage`
5. Redirects to `index.html` on success

### Accessing the Token

```javascript
// Get the token from localStorage
const token = localStorage.getItem('token');

// Get user info
const usuario = JSON.parse(localStorage.getItem('usuario'));
```

### Using the Token in API Requests

```javascript
fetch('http://localhost:3000/api/protected-endpoint', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

## Security Notes

### JWT Secret
The JWT secret is currently hardcoded. **For production, set it as an environment variable:**

```bash
export JWT_SECRET="your-secure-random-secret-key"
```

### Token Expiration
Tokens are valid for 24 hours by default.

### Password Storage
Currently, passwords are stored in plain text in the database. **For production, passwords should be hashed** using bcrypt:

```javascript
// When creating a user (in registration)
const hashedPassword = await bcrypt.hash(password, 10);

// When verifying login
const isValid = await bcrypt.compare(password, user.contraseña);
```

### Recommendations for Production
1. Use environment variables for sensitive data (JWT_SECRET, database credentials)
2. Hash passwords with bcrypt
3. Implement rate limiting on the login endpoint
4. Use HTTPS in production
5. Implement token refresh mechanism
6. Add token blacklisting for logout functionality

## Testing

To test the login endpoint:

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"test@example.com","contrasena":"password123"}'
```
