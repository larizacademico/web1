package com.projetomilhas.backend.controller;

import com.projetomilhas.backend.dto.auth.AuthRequest;
import com.projetomilhas.backend.dto.auth.AuthResponse;
import com.projetomilhas.backend.dto.user.ForgotPasswordRequest;
import com.projetomilhas.backend.dto.user.ResetPasswordRequest;
import com.projetomilhas.backend.dto.user.SignupRequest;
import com.projetomilhas.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest req) {
        authService.signup(req);
        return ResponseEntity.status(201).build();
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        String token = authService.forgotPassword(req.getEmail());
        return ResponseEntity.ok(java.util.Map.of(
                "message", "Token gerado (modo demo)",
                "token", token
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        authService.resetPassword(req);
        return ResponseEntity.ok().build();
    }
}
