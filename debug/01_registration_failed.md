# Bug #1: Registration Failed — "Validation failed"

## Symptom
- User fills out the registration form and clicks "Register"
- UI shows: **"Registration Failed — Validation failed"**
- Browser Console: `AxiosError: Request failed with status code 400`

## How to Investigate

### Step 1: Browser DevTools → Network Tab
```
POST /api/v1/auth/register → 400 Bad Request
```
Look at the **Response Body** — Spring Boot returns a JSON validation error:
```json
{
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": { "fieldName": "must not be blank" }
}
```

### Step 2: Check the Request Payload
Click the request → **Payload** tab. Compare the field names the frontend sends vs what the backend DTO expects:
```
Frontend sends:    { "name": "...", "email": "...", "password": "..." }
Backend expects:   { "fullName": "...", "email": "...", "password": "..." }
                     ^^^^^^^^ MISMATCH
```

### Step 3: Find the Backend DTO
```powershell
Get-ChildItem -Path backend/src -Recurse -Include *.java | Select-String "class RegisterRequest"
```
Open the file and check `@NotBlank` annotated fields — those are required.

## Root Cause
The frontend `RegisterPage.tsx` was sending field names that didn't match the backend `RegisterRequest.java` DTO field names. Spring's `@Valid` annotation rejected the request because required fields appeared blank.

## Fix Applied
- **File**: `frontend/src/features/auth/RegisterPage.tsx`
- **Change**: Aligned form field names to match backend DTO (`fullName` instead of `name`, etc.)

## Lesson Learned
> Always compare the **exact** JSON field names between frontend and backend DTOs.
> Check `@NotBlank`, `@NotNull`, `@Valid` annotations on the backend DTO to know which fields are mandatory.
