package com.physiqo.auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {
    private UUID id;
    private String email;
    private String accessToken;
    private String refreshToken;
    private Long expiresIn;
    private Instant createdAt;
}
