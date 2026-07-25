# Bug #7: MinIO Bucket Not Found — NoSuchBucketException

## Symptom
- File upload passes MIME validation → MinIO `putObject` call fails
- Backend returns HTTP 500
- Browser Console: `AxiosError: Request failed with status code 500`

## How to Investigate

### Step 1: Backend Logs
```powershell
docker logs physiqo-backend --tail 50
```
Look for:
```
ERROR c.p.s.service.MinioStorageService — Failed to upload file to S3/MinIO:
  The specified bucket does not exist (Service: S3, Status Code: 404)
software.amazon.awssdk.services.s3.model.NoSuchBucketException
```

### Step 2: Verify Bucket Exists in MinIO
```powershell
# Open MinIO web console
# http://localhost:9001 (default credentials: physiqo / physiqo_dev)
# Check if the bucket "physiqo-uploads" exists in the dashboard
```

Or via CLI:
```powershell
docker exec physiqo-minio mc ls local/
# If "physiqo-uploads" is not listed, the bucket doesn't exist
```

### Step 3: Check the Bucket Name Configuration
```powershell
Get-ChildItem -Path backend/src -Recurse -Include *.java,*.yml | Select-String "physiqo-uploads"
```

## Root Cause
The MinIO container was started fresh (or volumes were reset), but no initialization script created the `physiqo-uploads` bucket. The `MinioStorageService` assumed the bucket already existed.

## Fix Applied
- **File**: `backend/src/main/java/com/physiqo/storage/service/MinioStorageService.java`
- **Change**: Added `@PostConstruct` lifecycle hook to auto-create the bucket on app startup:
  ```java
  @PostConstruct
  public void ensureBucketExists() {
      try {
          s3Client.headBucket(HeadBucketRequest.builder().bucket(bucket).build());
      } catch (NoSuchBucketException e) {
          log.info("Bucket '{}' does not exist. Creating...", bucket);
          s3Client.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
      }
  }
  ```
- Also called `ensureBucketExists()` before each upload as a safety net.

## Verification
After restart, check logs for:
```
INFO c.p.s.service.MinioStorageService — Bucket 'physiqo-uploads' does not exist in MinIO. Creating...
INFO c.p.s.service.MinioStorageService — Bucket 'physiqo-uploads' created successfully.
```

## Lesson Learned
> Never assume external resources (buckets, queues, topics) exist at runtime.
> Use `@PostConstruct` or startup listeners to verify and create required infrastructure.
> This is especially important in Docker where containers start from scratch.
