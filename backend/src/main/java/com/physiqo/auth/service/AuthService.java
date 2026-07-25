package com.physiqo.auth.service;

import com.physiqo.auth.dto.*;
import com.physiqo.common.exception.AuthenticationException;
import com.physiqo.common.exception.BusinessRuleException;
import com.physiqo.common.exception.ErrorCode;
import com.physiqo.common.security.JwtTokenProvider;
import com.physiqo.user.entity.User;
import com.physiqo.user.entity.UserProfile;
import com.physiqo.user.repository.UserProfileRepository;
import com.physiqo.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final StringRedisTemplate redisTemplate;

    // Fallback storage if Redis connection is not established during dev/testing
    private final Map<String, String> inMemoryRefreshTokens = new ConcurrentHashMap<>();

    private static final String REFRESH_TOKEN_KEY_PREFIX = "refresh_token:";
    private static final long REFRESH_TOKEN_EXPIRATION_DAYS = 7;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        if (userRepository.existsByEmail(email)) {
            throw new BusinessRuleException(ErrorCode.AUTH_EMAIL_EXISTS, "Email address is already registered");
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role("USER")
                .enabled(true)
                .emailVerified(false)
                .build();

        User savedUser = userRepository.save(user);

        // Create default profile
        UserProfile profile = UserProfile.builder()
                .userId(savedUser.getId())
                .unitPreference("METRIC")
                .timezone("UTC")
                .build();

        userProfileRepository.save(profile);

        return AuthResponse.builder()
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .createdAt(savedUser.getCreatedAt())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException(ErrorCode.AUTH_INVALID_CREDENTIALS, "Invalid email or password"));

        if (!user.isEnabled()) {
            throw new AuthenticationException(ErrorCode.AUTH_ACCOUNT_DISABLED, "Account is disabled");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new AuthenticationException(ErrorCode.AUTH_INVALID_CREDENTIALS, "Invalid email or password");
        }

        String accessToken = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole());
        String refreshToken = UUID.randomUUID().toString();

        storeRefreshToken(refreshToken, user.getId().toString());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(900L) // 15 minutes in seconds
                .build();
    }

    public AuthResponse refresh(RefreshRequest request) {
        String refreshToken = request.getRefreshToken();
        String userIdStr = getUserIdFromRefreshToken(refreshToken);

        if (userIdStr == null) {
            throw new AuthenticationException(ErrorCode.AUTH_TOKEN_INVALID, "Invalid or expired refresh token");
        }

        UUID userId = UUID.fromString(userIdStr);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthenticationException(ErrorCode.AUTH_TOKEN_INVALID, "User not found"));

        if (!user.isEnabled()) {
            throw new AuthenticationException(ErrorCode.AUTH_ACCOUNT_DISABLED, "Account is disabled");
        }

        // Token rotation: invalidate old refresh token, generate new one
        deleteRefreshToken(refreshToken);

        String newAccessToken = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole());
        String newRefreshToken = UUID.randomUUID().toString();

        storeRefreshToken(newRefreshToken, user.getId().toString());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .expiresIn(900L)
                .build();
    }

    public void logout(String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            deleteRefreshToken(refreshToken);
        }
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthenticationException(ErrorCode.AUTH_INVALID_CREDENTIALS, "User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new AuthenticationException(ErrorCode.AUTH_INVALID_CREDENTIALS, "Current password does not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private void storeRefreshToken(String token, String userId) {
        try {
            redisTemplate.opsForValue().set(
                    REFRESH_TOKEN_KEY_PREFIX + token,
                    userId,
                    Duration.ofDays(REFRESH_TOKEN_EXPIRATION_DAYS)
            );
        } catch (Exception ex) {
            log.warn("Redis unavailable, storing refresh token in memory fallback: {}", ex.getMessage());
            inMemoryRefreshTokens.put(token, userId);
        }
    }

    private String getUserIdFromRefreshToken(String token) {
        try {
            String userId = redisTemplate.opsForValue().get(REFRESH_TOKEN_KEY_PREFIX + token);
            if (userId != null) {
                return userId;
            }
        } catch (Exception ex) {
            log.warn("Redis unavailable, fetching refresh token from memory fallback: {}", ex.getMessage());
        }
        return inMemoryRefreshTokens.get(token);
    }

    private void deleteRefreshToken(String token) {
        try {
            redisTemplate.delete(REFRESH_TOKEN_KEY_PREFIX + token);
        } catch (Exception ex) {
            log.warn("Redis unavailable during token deletion: {}", ex.getMessage());
        }
        inMemoryRefreshTokens.remove(token);
    }
}
