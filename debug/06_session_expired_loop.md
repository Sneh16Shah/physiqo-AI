# Bug #6: Session Expired Message in 1 Second After Login

## Symptom
- User logs in successfully → redirected to Dashboard
- Within 1 second, a "Session Expired" toast appears and user is logged out
- This happens on every single login attempt

## How to Investigate

### Step 1: Browser DevTools → Network Tab
After login, watch the first API call the Dashboard makes:
```
GET /api/v1/ai/insights → 401 Unauthorized
```
Click it → check the **Request Headers**:
```
Authorization: Bearer undefined    ← THIS IS THE PROBLEM
```

### Step 2: Check What Login Returns
Find the login response in Network tab:
```json
{
  "accessToken": "eyJhbGci...",    ← Backend field name
  "refreshToken": "dGhpcyBp...",
  "id": "uuid-here",
  "email": "user@example.com"
}
```

### Step 3: Check What Frontend Reads
```powershell
Get-ChildItem -Path frontend/src -Recurse -Include *.tsx | Select-String "response.data.token"
```
If the frontend reads `response.data.token` but the backend returns `response.data.accessToken` → the token is `undefined`.

### Step 4: Check localStorage
After login, in DevTools → Application → Local Storage:
```
token: "undefined"    ← String "undefined", not the actual JWT
```

## Root Cause
**Field name mismatch** between backend response and frontend extraction:

```
Backend AuthResponse.java returns:     { "accessToken": "eyJ...", "refreshToken": "..." }
Frontend LoginPage.tsx extracted:      response.data.token     → undefined
                                       response.data.user      → undefined
```

When `undefined` was stored as the token, subsequent API calls sent `Authorization: Bearer undefined`, which Spring Security rejected → 401 → Axios interceptor triggered logout → "Session Expired".

## Fix Applied

### Frontend — `LoginPage.tsx`
```typescript
// BEFORE (broken)
const token = response.data.token;        // undefined
const user = response.data.user;          // undefined

// AFTER (fixed)
const resData = response.data;
const token = resData.accessToken;        // "eyJhbGci..."
const refreshToken = resData.refreshToken;
const user = { id: resData.id, email: resData.email };
```

### Frontend — `authStore.ts`
```typescript
// Added validation to prevent storing "undefined"
function getValidToken(): string | null {
  const token = localStorage.getItem('token');
  if (!token || token === 'undefined' || token === 'null') return null;
  return token;
}
```

### Frontend — `client.ts`
```typescript
// Only attach header if token is a real string
const token = getValidToken();
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}
```

## How to Verify the Backend's Response Shape
```powershell
# Find the AuthResponse DTO
Get-ChildItem -Path backend/src -Recurse -Include *.java | Select-String "class AuthResponse"
# Open it and check the exact field names
```

## Lesson Learned
> **ALWAYS** check the exact field names in the backend response DTO before reading them on the frontend.
> Add a guard: if the token is `undefined` or `null` after extraction, throw an error immediately rather than storing it.
> This is the #1 cause of "instant logout after login" bugs in JWT-based apps.
