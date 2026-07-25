package com.physiqo.storage.service;

import com.physiqo.common.exception.ErrorCode;
import com.physiqo.common.exception.ResourceNotFoundException;
import com.physiqo.common.exception.StorageException;
import com.physiqo.common.exception.ValidationException;
import com.physiqo.storage.dto.FileResponseDto;
import com.physiqo.storage.entity.UploadedFile;
import com.physiqo.storage.repository.UploadedFileRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.InputStream;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MinioStorageService implements StorageService {

    private final UploadedFileRepository fileRepository;
    private final S3Client s3Client;

    @Value("${minio.bucket:physiqo-uploads}")
    private String bucket;

    @Value("${minio.endpoint:http://localhost:9000}")
    private String minioEndpoint;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/pjpeg", "image/png", "image/webp",
            "application/pdf", "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/octet-stream"
    );

    @PostConstruct
    public void ensureBucketExists() {
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucket).build());
        } catch (NoSuchBucketException e) {
            log.info("Bucket '{}' does not exist in MinIO. Creating...", bucket);
            try {
                s3Client.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
                log.info("Bucket '{}' created successfully.", bucket);
            } catch (Exception createEx) {
                log.error("Failed to create MinIO bucket '{}': {}", bucket, createEx.getMessage());
            }
        } catch (Exception e) {
            log.warn("MinIO bucket status check exception: {}", e.getMessage());
        }
    }

    @Override
    @Transactional
    public FileResponseDto uploadFile(UUID userId, MultipartFile file, String category) {
        if (file == null || file.isEmpty()) {
            throw new ValidationException("Uploaded file cannot be empty");
        }

        if (file.getSize() > 15 * 1024 * 1024) {
            throw new StorageException(ErrorCode.STORAGE_FILE_TOO_LARGE, "File size exceeds 15MB limit");
        }

        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
        String ext = originalFilename.contains(".") ? originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase() : "";

        boolean isAllowedType = contentType != null && ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase());
        boolean isAllowedExt = Set.of(".jpg", ".jpeg", ".png", ".webp", ".pdf", ".doc", ".docx").contains(ext);

        if (!isAllowedType && !isAllowedExt) {
            throw new ValidationException("Unsupported file type: " + contentType + " (file: " + originalFilename + ")");
        }

        ensureBucketExists();

        String objectKey = String.format("%s/%s/%s%s", userId, category.toLowerCase(), UUID.randomUUID(), ext);

        try (InputStream inputStream = file.getInputStream()) {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(objectKey)
                    .contentType(contentType != null ? contentType : "application/octet-stream")
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(inputStream, file.getSize()));
        } catch (Exception ex) {
            log.error("Failed to upload file to S3/MinIO: {}", ex.getMessage(), ex);
            throw new StorageException(ErrorCode.STORAGE_UPLOAD_FAILED, "Failed to store file", ex);
        }

        UploadedFile uploadedFile = UploadedFile.builder()
                .userId(userId)
                .bucket(bucket)
                .objectKey(objectKey)
                .originalFilename(originalFilename)
                .contentType(contentType != null ? contentType : "application/octet-stream")
                .sizeBytes(file.getSize())
                .category(category.toUpperCase())
                .build();

        UploadedFile saved = fileRepository.save(uploadedFile);
        String url = String.format("%s/%s/%s", minioEndpoint, bucket, objectKey);

        return FileResponseDto.builder()
                .id(saved.getId())
                .originalFilename(saved.getOriginalFilename())
                .contentType(saved.getContentType())
                .sizeBytes(saved.getSizeBytes())
                .category(saved.getCategory())
                .url(url)
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public String getPresignedUrl(UUID fileId) {
        UploadedFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.INTERNAL_ERROR, "Uploaded file not found: " + fileId));

        return String.format("%s/%s/%s", minioEndpoint, file.getBucket(), file.getObjectKey());
    }
}
