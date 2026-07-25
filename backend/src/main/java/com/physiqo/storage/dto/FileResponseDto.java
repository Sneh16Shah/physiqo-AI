package com.physiqo.storage.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class FileResponseDto {
    private UUID id;
    private String originalFilename;
    private String contentType;
    private Long sizeBytes;
    private String category;
    private String url;
    private Instant createdAt;
}
