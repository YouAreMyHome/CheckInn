# JWT Authentication System Documentation

## 📚 Overview

The CheckInn JWT Authentication System provides comprehensive user authentication and authorization with the following features:

- **JWT Access & Refresh Tokens** - Secure authentication with automatic token refresh
- **Password Security** - Bcrypt hashing with configurable rounds
- **Email Verification** - Account email verification system
- **Password Reset** - Secure password reset via email
- **Account Security** - Account lockout protection after failed attempts
- **Input Validation** - Comprehensive request validation and sanitization
- **Activity Tracking** - User activity and security event logging

## 🔐 Authentication Endpoints

### Public Endpoints (No Authentication Required)

#### User Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "0987654321",
  "password": "SecurePass123!",
  "role": "Customer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Customer",
      "isEmailVerified": false
    }
  }
}
```

#### User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```http
PATCH /api/auth/reset-password/:token
Content-Type: application/json

{
  "password": "NewSecurePass123!",
  "passwordConfirm": "NewSecurePass123!"
}
```

#### Email Verification
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification_token_from_email"
}
```

#### Resend Verification Email
```http
POST /api/auth/resend-verification
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Refresh Access Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "your_refresh_token_here"
}
```

### Protected Endpoints (Authentication Required)

#### Get Current User Profile
```http
GET /api/auth/me
Authorization: Bearer your_jwt_token_here
```

#### Update User Profile
```http
PATCH /api/auth/update-me
Authorization: Bearer your_jwt_token_here
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "0987654321",
  "preferences": {
    "language": "en",
    "currency": "USD",
    "notifications": {
      "email": true,
      "sms": false,
      "push": true
    }
  }
}
```

#### Update Password
```http
PATCH /api/auth/update-password
Authorization: Bearer your_jwt_token_here
Content-Type: application/json

{
  "passwordCurrent": "CurrentPass123!",
  "password": "NewSecurePass123!",
  "passwordConfirm": "NewSecurePass123!"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer your_jwt_token_here
Content-Type: application/json

{
  "refreshToken": "your_refresh_token_here"
}
```

#### Deactivate Account
```http
DELETE /api/auth/delete-me
Authorization: Bearer your_jwt_token_here
```

## 🔧 Authentication Flow

### 1. Registration Flow
```
User → POST /api/auth/register → Validate Input → Hash Password → Save User → Generate JWT Tokens → Send Response + Verification Email
```

### 2. Login Flow
```
User → POST /api/auth/login → Validate Credentials → Check Account Status → Generate JWT Tokens → Send Response
```

### 3. Token Refresh Flow
```
Client → POST /api/auth/refresh-token → Validate Refresh Token → Generate New Access Token → Send Response
```

### 4. Password Reset Flow
```
User → POST /api/auth/forgot-password → Generate Reset Token → Send Email → User clicks link → PATCH /api/auth/reset-password/:token → Update Password
```

## 🛡️ Security Features

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter  
- At least 1 number
- At least 1 special character (@$!%*?&)

### Account Lockout
- Max 5 failed login attempts (configurable)
- Account locked for 15 minutes after max attempts
- Automatic unlock after lockout period

### JWT Token Security
- Access tokens expire in 24 hours (configurable)
- Refresh tokens expire in 7 days (configurable)
- Tokens include issuer and audience claims
- Secure HTTP-only cookies for web clients

### Input Validation
- Email format validation
- Phone number format validation (Vietnamese format)
- XSS protection with HTML sanitization
- SQL injection protection with parameterized queries

## 🔑 Environment Variables

Required environment variables for JWT authentication:

```env
# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_here
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7

# Email Configuration (for password reset & verification)
EMAIL_FROM=noreply@checkinn.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Security Settings
MAX_LOGIN_ATTEMPTS=5
LOCK_TIME=15

# Cookie Settings
COOKIE_MAX_AGE=86400000
COOKIE_SECURE=false
COOKIE_HTTP_ONLY=true
```

## 📱 Frontend Integration

### Using JWT Tokens in Client Applications

#### Store Tokens Securely
```javascript
// Store tokens in secure storage
localStorage.setItem('accessToken', response.data.token);
localStorage.setItem('refreshToken', response.data.refreshToken);
```

#### Add Authorization Header
```javascript
// Add to all authenticated requests
const token = localStorage.getItem('accessToken');
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

#### Handle Token Expiration
```javascript
// Automatically refresh tokens on 401 errors
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await axios.post('/api/auth/refresh-token', { refreshToken });
      
      if (response.data.success) {
        localStorage.setItem('accessToken', response.data.token);
        // Retry original request
        return axios.request(error.config);
      } else {
        // Redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

## 🧪 Testing

### Run Authentication Tests
```bash
cd apps/api-server
node test-jwt-auth.js
```

### Manual Testing with cURL

#### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "0987654321", 
    "password": "TestPass123!",
    "role": "Customer"
  }'
```

#### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

#### Access Protected Route
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 🔄 Middleware Usage

### Protect Routes
```javascript
const { protect } = require('../middlewares/auth.middleware');

// Apply to single route
router.get('/protected-route', protect, controller);

// Apply to all routes after middleware
router.use(protect);
```

### Role-Based Authorization
```javascript
const { protect, restrictTo } = require('../middlewares/auth.middleware');

// Admin only
router.delete('/admin-only', protect, restrictTo('Admin'), controller);

// Multiple roles
router.get('/partner-admin', protect, restrictTo('HotelPartner', 'Admin'), controller);
```

## 🚨 Error Handling

### Common Error Responses

#### Validation Error (400)
```json
{
  "success": false,
  "message": "Registration validation failed",
  "errors": [
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter"
    }
  ]
}
```

#### Authentication Error (401)
```json
{
  "success": false,
  "message": "Authentication required. Please log in to access this resource."
}
```

#### Account Locked (423)
```json
{
  "success": false,
  "message": "Account temporarily locked due to too many failed login attempts. Try again later."
}
```

## 📈 Best Practices

### Client-Side
- Store JWT tokens in secure storage (not localStorage for sensitive apps)
- Implement automatic token refresh
- Handle authentication errors gracefully
- Clear tokens on logout
- Use HTTPS in production

### Server-Side
- Use strong JWT secrets (256-bit minimum)
- Implement proper CORS policies
- Log security events for monitoring
- Rate limit authentication endpoints
- Use secure cookies for web applications

### Security
- Regularly rotate JWT secrets
- Monitor for suspicious login patterns
- Implement proper session management
- Use strong password policies
- Enable email notifications for security events

---

**🎯 The JWT Authentication System is now complete and ready for production use!**