package com.projetomilhas.backend.dto.auth;

import lombok.*;

@Getter
@AllArgsConstructor
public class AuthResponse {
    private final String token;
}
