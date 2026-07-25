# Bug #3: Black Screen on Load

## Symptom
- Navigate to `http://localhost:5173` → completely black/blank screen
- No UI renders at all
- Browser Console shows: `SyntaxError: Unexpected token 'u' in JSON at position 0`

## How to Investigate

### Step 1: Browser Console (F12)
Look for JavaScript errors. A `SyntaxError` during JSON parsing usually means:
```
JSON.parse(undefined)  → SyntaxError: Unexpected token 'u'
JSON.parse("")         → SyntaxError: Unexpected end of JSON input
JSON.parse("null")     → returns null (this is actually fine)
```

### Step 2: Check What's Being Parsed
The error originates in a Zustand store that reads from `localStorage`:
```typescript
// This crashes if localStorage has corrupted data
const user = JSON.parse(localStorage.getItem('user'));
```

### Step 3: Inspect localStorage
In DevTools → **Application** tab → **Local Storage** → `http://localhost:5173`
Look for keys like `user`, `token` — check if their values are valid JSON.

## Root Cause
The Zustand auth store (`authStore.ts`) called `JSON.parse(localStorage.getItem('user'))` during initialization. If `localStorage` contained `"undefined"`, `""`, or malformed JSON, the parse threw an unhandled exception that crashed the entire React tree → black screen.

## Fix Applied
Two changes:

### 1. Safe JSON Parser — `authStore.ts`
```typescript
function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw || raw === 'undefined' || raw === 'null') return null;
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem('user');
    return null;
  }
}
```

### 2. Global Error Boundary — `ErrorBoundary.tsx`
```tsx
class ErrorBoundary extends React.Component {
  componentDidCatch(error) {
    // Renders a recovery UI instead of a blank screen
  }
}
```
Wrapped the entire app in `<ErrorBoundary>` in `App.tsx`.

## Lesson Learned
> **NEVER** call `JSON.parse()` without `try/catch` on user-controlled data (localStorage, URL params, cookies).
> Always add a React Error Boundary at the app root so crashes show a recovery UI, not a blank screen.
