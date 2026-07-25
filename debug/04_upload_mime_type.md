# Bug #4: Upload Error — MIME Type Rejection

## Symptom
- User uploads a WhatsApp image → "Upload Error: Failed to process WhatsApp Image..."
- Browser Console: `AxiosError: Request failed with status code 500`

## How to Investigate

### Step 1: Browser DevTools → Network Tab
```
POST /api/v1/body-composition/reports/upload → 500
```
Check the **Request Headers** for `Content-Type: multipart/form-data`.

### Step 2: Backend Logs
```powershell
docker logs physiqo-backend --tail 50
```
Look for: `Unsupported file type` or `ValidationException`

### Step 3: Check What MIME Type the Browser Sends
In DevTools Network tab → click the request → **Headers** → look at the file's content type in the multipart body. WhatsApp images often send unusual MIME types:
```
image/jpg            ← Non-standard (standard is image/jpeg)
image/pjpeg          ← Old IE format
application/octet-stream  ← Generic binary
```

## Root Cause
`MinioStorageService.java` had a strict allowlist of MIME types:
```java
Set.of("image/jpeg", "image/png", "image/webp")  // Missing image/jpg, image/pjpeg, etc.
```
WhatsApp and mobile browsers send `image/jpg` or `application/octet-stream`, which were rejected.

## Fix Applied
- **File**: `backend/src/main/java/com/physiqo/storage/service/MinioStorageService.java`
- **Change**: Expanded allowlist + added file extension fallback:
  ```java
  private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
      "image/jpeg", "image/jpg", "image/pjpeg", "image/png", "image/webp",
      "application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/octet-stream"
  );

  // Also check file extension as fallback
  boolean isAllowedExt = Set.of(".jpg", ".jpeg", ".png", ".webp", ".pdf", ".doc", ".docx").contains(ext);
  if (!isAllowedType && !isAllowedExt) { throw ... }
  ```

## Lesson Learned
> Don't rely only on MIME type for file validation — mobile apps and messaging apps send non-standard MIME types.
> Always add a **file extension fallback** check.
> Common gotcha: `image/jpg` is NOT the same as `image/jpeg` (the official IANA type).
