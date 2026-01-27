package com.projetomilhas.backend.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @NotBlank
    private String name;

    @Email
    @NotBlank
    private String email;

    // opcional (só se for trocar senha)
    private String currentPassword;
    private String newPassword;
}
