package com.physiqo.user.service;

import com.physiqo.common.exception.ErrorCode;
import com.physiqo.common.exception.ResourceNotFoundException;
import com.physiqo.user.dto.UpdateProfileRequest;
import com.physiqo.user.dto.UserProfileDto;
import com.physiqo.user.entity.UserProfile;
import com.physiqo.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserProfileRepository profileRepository;

    @Transactional(readOnly = true)
    public UserProfileDto getProfile(UUID userId) {
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.NOT_FOUND_PROFILE, "Profile not found for user: " + userId));

        return toDto(profile);
    }

    @Transactional
    public UserProfileDto updateProfile(UUID userId, UpdateProfileRequest request) {
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> UserProfile.builder().userId(userId).build());

        if (request.getDisplayName() != null) profile.setDisplayName(request.getDisplayName());
        if (request.getDateOfBirth() != null) profile.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) profile.setGender(request.getGender());
        if (request.getHeightCm() != null) profile.setHeightCm(request.getHeightCm());
        if (request.getActivityLevel() != null) profile.setActivityLevel(request.getActivityLevel());
        if (request.getFitnessGoal() != null) profile.setFitnessGoal(request.getFitnessGoal());
        if (request.getUnitPreference() != null) profile.setUnitPreference(request.getUnitPreference());
        if (request.getTimezone() != null) profile.setTimezone(request.getTimezone());

        UserProfile saved = profileRepository.save(profile);
        return toDto(saved);
    }

    @Transactional
    public void updateAvatar(UUID userId, UUID avatarFileId) {
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> UserProfile.builder().userId(userId).build());

        profile.setAvatarFileId(avatarFileId);
        profileRepository.save(profile);
    }

    private UserProfileDto toDto(UserProfile profile) {
        return UserProfileDto.builder()
                .id(profile.getId())
                .userId(profile.getUserId())
                .displayName(profile.getDisplayName())
                .dateOfBirth(profile.getDateOfBirth())
                .gender(profile.getGender())
                .heightCm(profile.getHeightCm())
                .activityLevel(profile.getActivityLevel())
                .fitnessGoal(profile.getFitnessGoal())
                .unitPreference(profile.getUnitPreference())
                .avatarFileId(profile.getAvatarFileId())
                .timezone(profile.getTimezone())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}
