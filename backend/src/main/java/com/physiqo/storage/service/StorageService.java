package com.physiqo.storage.service;

import com.physiqo.storage.dto.FileResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface StorageService {
    FileResponseDto uploadFile(UUID userId, MultipartFile file, String category);
    String getPresignedUrl(UUID fileId);
}
