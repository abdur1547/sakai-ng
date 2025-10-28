# Authentication Architecture Refactoring

## Overview

The authentication system has been refactored to separate JWT token management from authentication logic, creating a more maintainable and focused architecture.

## Services

### 1. TokenService (`token.service.ts`)

**Responsibilities:**
- JWT token storage (access & refresh tokens)
- Automatic token refresh with timer
- Token validation and expiration handling
- localStorage token management

**Key Methods:**
- `setTokens(tokens: AuthTokens)` - Store new tokens and start refresh timer
- `getAccessToken()` - Get current access token
- `getRefreshToken()` - Get current refresh token
- `refreshToken()` - Refresh access token using refresh token
- `clearTokens()` - Clear all tokens and stop timer
- `hasValidTokens()` - Check if valid tokens exist

**Key Features:**
- Automatic token refresh 10 seconds before expiration
- Observable `isTokenValid$` for reactive token state monitoring
- Proper cleanup on token invalidation

### 2. AuthService (`auth.service.ts`)

**Responsibilities:**
- User authentication (login, signup, logout)
- Password management (reset, change)
- User session management
- User data fetching

**Key Methods:**
- `login(credentials)` - Authenticate user and get tokens
- `signup(credentials)` - Register new user
- `logout()` - End user session
- `requestPasswordReset(email)` - Request password reset
- `confirmPasswordReset(token, password)` - Confirm password reset
- `changePassword(passwords)` - Change user password
- `getCurrentUser()` - Fetch current user data
- `isAuthenticated()` - Check authentication status

**Key Features:**
- Uses TokenService for all token operations
- Maintains current user state
- Handles authentication flow end-to-end
- Proper error handling and logout on token issues

### 3. AuthInterceptor (`auth.interceptor.ts`)

**Updated to use TokenService:**
- Gets access tokens from TokenService
- Handles token refresh through TokenService
- Properly triggers logout through AuthService on refresh failure

## Interface Updates

New interfaces added for comprehensive auth operations:

```typescript
interface SignupCredentials {
  email: string;
  password: string;
  name: string;
  confirmPassword?: string;
}

interface ResetPasswordRequest {
  email: string;
}

interface ResetPasswordConfirm {
  token: string;
  password: string;
  confirmPassword: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

## Benefits of Separation

### 1. **Single Responsibility Principle**
- TokenService: Only handles JWT tokens
- AuthService: Only handles authentication operations

### 2. **Improved Testability**
- Services can be tested independently
- Easier to mock token operations
- Clear separation of concerns

### 3. **Better Maintainability**
- Token logic centralized in one place
- Auth operations clearly defined
- Easier to add new auth features

### 4. **Reusability**
- TokenService can be used by other services
- Auth operations independent of token management
- Clear API boundaries

## Usage Examples

### Login Component
```typescript
// Login remains the same - uses AuthService
this.authService.login(credentials).subscribe({
  next: (user) => this.router.navigate(['/']),
  error: (error) => this.handleError(error)
});
```

### Other Services Needing Tokens
```typescript
// Can now inject TokenService directly
constructor(private tokenService: TokenService) {}

someMethod() {
  const token = this.tokenService.getAccessToken();
  // Use token for API calls
}
```

### Checking Authentication Status
```typescript
// Multiple ways to check auth status
const isAuth1 = this.authService.isAuthenticated(); // Sync check
const isAuth2$ = this.authService.isAuthenticated$; // Observable
const hasTokens$ = this.tokenService.isTokenValid$; // Token-specific
```

## Migration Guide

### For existing code using AuthService for tokens:
- Replace `authService.getAccessToken()` with `tokenService.getAccessToken()`
- Replace direct token operations with TokenService methods
- Auth operations (login, logout) remain with AuthService

### For new features:
- Use TokenService for any token-related operations
- Use AuthService for user authentication and management
- Follow the clear separation of concerns