# Bug #5: 403 Forbidden on Upload

## Symptom
- User is logged in, uploads a file → `AxiosError: Request failed with status code 403`
- Token exists in localStorage, user appears authenticated

## How to Investigate

### Step 1: Browser DevTools → Network Tab
```
POST /api/v1/body-composition/reports/upload → 403 Forbidden
```
Check the **Request Headers**:
```
Authorization: Bearer eyJhbGci...   ← Is this present and valid?
```

### Step 2: Distinguish 401 vs 403
| Code | Meaning | Cause |
|------|---------|-------|
| 401 | Not authenticated | Token missing, expired, or malformed |
| 403 | Authenticated but forbidden | Endpoint not in SecurityConfig's permit list |

### Step 3: Check SecurityConfig
```powershell
Get-ChildItem -Path backend/src -Recurse -Include *.java | Select-String "SecurityConfig"
```
Look for the `SecurityFilterChain` bean and check which paths are `.permitAll()` vs `.authenticated()`.

### Step 4: Check if Spring Returns 403 Instead of 401
By default, Spring Security returns **403** for unauthenticated requests (not 401) unless you configure an `authenticationEntryPoint`.

## Root Cause
Two issues combined:
1. **Spring Security** returned 403 instead of 401 for unauthenticated requests (no custom `authenticationEntryPoint`)
2. **Axios interceptor** in `client.ts` only caught 401 errors for token refresh, so 403 errors went unhandled

## Fix Applied

### Backend — `SecurityConfig.java`
```java
.exceptionHandling(ex -> ex
    .authenticationEntryPoint((request, response, authException) -> {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401, not 403
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"Unauthorized\"}");
    })
)
```

### Frontend — `client.ts`
```typescript
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Try refresh token, fallback to logout
    }
  }
);
```

## Lesson Learned
> Spring Security's default behavior returns **403 Forbidden** for unauthenticated requests, not 401.
> Always configure `authenticationEntryPoint` to return 401.
> Frontend interceptors should handle **both** 401 and 403.
