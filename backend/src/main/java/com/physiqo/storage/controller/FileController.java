package com.physiqo.storage.controller;

import com.physiqo.common.security.CurrentUser;
import com.physiqo.common.security.UserPrincipal;
import com.physiqo.storage.dto.FileResponseDto;
import com.physiqo.storage.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class FileController {

    private final StorageService storageService;

    @PostMapping("/upload")
    public ResponseEntity<FileResponseDto> uploadFile(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", defaultValue = "GENERAL") String category) {
        FileResponseDto response = storageService.uploadFile(currentUser.getId(), file, category);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
