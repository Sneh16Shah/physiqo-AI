package com.physiqo.user.controller;

import com.physiqo.common.security.CurrentUser;
import com.physiqo.common.security.UserPrincipal;
import com.physiqo.user.dto.UpdateProfileRequest;
import com.physiqo.user.dto.UserProfileDto;
import com.physiqo.user.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserProfileService profileService;

    @GetMapping
    public ResponseEntity<UserProfileDto> getProfile(@CurrentUser UserPrincipal currentUser) {
        UserProfileDto profile = profileService.getProfile(currentUser.getId());
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<UserProfileDto> updateProfile(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserProfileDto updated = profileService.updateProfile(currentUser.getId(), request);
        return ResponseEntity.ok(updated);
    }
}
