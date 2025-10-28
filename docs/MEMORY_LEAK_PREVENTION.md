# Memory Leak Prevention - TokenService

## Problem
The `refreshTokenTimeout` in TokenService could cause memory leaks if not properly cleared when:
1. User closes the browser window/tab
2. The Angular app is destroyed
3. The service is destroyed
4. User navigates away from the application

## Solution Implemented

### 1. **OnDestroy Lifecycle Hook**
```typescript
export class TokenService extends BaseHttpService implements OnDestroy {
  ngOnDestroy(): void {
    this.cleanup();
  }
}
```

### 2. **Window beforeunload Event Listener**
```typescript
private setupBeforeUnloadListener(): void {
  if (typeof window !== 'undefined') {
    this.beforeUnloadListener = () => {
      this.stopRefreshTokenTimer();
    };
    window.addEventListener('beforeunload', this.beforeUnloadListener);
  }
}
```

### 3. **App Component OnDestroy**
```typescript
export class AppComponent implements OnDestroy {
  private tokenService = inject(TokenService);

  ngOnDestroy(): void {
    this.tokenService.cleanup();
  }
}
```

### 4. **Visibility Change Handling**
Added support for tab visibility changes to pause/resume token refresh:
```typescript
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && this.hasValidTokens()) {
    this.startRefreshTokenTimer();
  }
});
```

## Memory Leak Prevention Features

### ✅ **Timeout Cleanup**
- `stopRefreshTokenTimer()` properly clears `setTimeout`
- Called on service destruction, window close, and manual cleanup

### ✅ **Event Listener Cleanup**
- `removeBeforeUnloadListener()` removes window event listeners
- Prevents memory leaks from dangling event handlers

### ✅ **Multiple Cleanup Triggers**
1. **Service Destruction**: `ngOnDestroy()` 
2. **Window Close**: `beforeunload` event
3. **App Destruction**: App component `ngOnDestroy()`
4. **Manual Cleanup**: Public `cleanup()` method

### ✅ **Safe Window Access**
```typescript
if (typeof window !== 'undefined') {
  // Window operations only in browser environment
}
```

### ✅ **Proper Timer Management**
```typescript
stopRefreshTokenTimer(): void {
  if (this.refreshTokenTimeout) {
    clearTimeout(this.refreshTokenTimeout);
    this.refreshTokenTimeout = undefined; // Prevent double-clear
  }
}
```

## Testing Memory Leaks

### Manual Testing Scenarios:
1. **Tab Close**: Open app, login, close tab → Timer should be cleared
2. **Browser Close**: Open app, login, close browser → Timer should be cleared  
3. **Navigation**: Login, navigate away → Timer should remain active
4. **Logout**: Login, logout → Timer should be cleared
5. **Token Expiry**: Let tokens expire → Timer should be cleared
6. **Tab Switch**: Switch tabs → Timer continues (or pauses based on config)

### Developer Tools Check:
```javascript
// In browser console, check for active timers
console.log('Active timeouts:', window.setTimeout.toString());

// Monitor memory usage in DevTools Performance tab
// Look for increasing memory usage patterns
```

## Best Practices Applied

### 1. **Defensive Programming**
- Check for `window` existence (SSR compatibility)
- Check for timeout existence before clearing
- Multiple cleanup paths ensure reliability

### 2. **Proper Event Management**
- Store event listener references for cleanup
- Remove all event listeners on destruction

### 3. **Clear Resource Management**
- Set references to `undefined` after cleanup
- Avoid double-cleanup scenarios
- Public cleanup method for external control

### 4. **Angular Lifecycle Integration**
- Implement `OnDestroy` interface
- Use Angular's dependency injection
- Follow Angular best practices for service cleanup

## Benefits

1. **No Memory Leaks**: Timers are always cleared
2. **Battery Efficiency**: No unnecessary background timers
3. **Resource Management**: Proper cleanup of event listeners
4. **SSR Compatible**: Safe window access patterns
5. **Testable**: Clear separation of concerns and public cleanup method
6. **Robust**: Multiple cleanup triggers ensure reliability