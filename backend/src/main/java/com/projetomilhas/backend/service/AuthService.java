package com.projetomilhas.backend.service;

import com.projetomilhas.backend.dto.auth.AuthRequest;
import com.projetomilhas.backend.dto.auth.AuthResponse;
import com.projetomilhas.backend.dto.user.ResetPasswordRequest;
import com.projetomilhas.backend.dto.user.SignupRequest;
import com.projetomilhas.backend.entity.UserEntity;
import com.projetomilhas.backend.repository.UserRepository;
import com.projetomilhas.backend.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final PasswordResetService passwordResetService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtil jwtUtil,
                       PasswordResetService passwordResetService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.passwordResetService = passwordResetService;
    }

    public void signup(SignupRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email já cadastrado");
        }

        UserEntity u = new UserEntity();
        u.setName(req.getName());
        u.setEmail(req.getEmail());
        u.setPassword(passwordEncoder.encode(req.getPassword()));

        userRepository.save(u);
    }

    public AuthResponse login(AuthRequest req) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            req.getEmail(),
                            req.getPassword()
                    )
            );
        } catch (Exception e) {
            throw new RuntimeException("Credenciais inválidas");
        }

        String token = jwtUtil.generateToken(req.getEmail());
        return new AuthResponse(token);
    }

    public String forgotPassword(String email) {
        return passwordResetService.createPasswordResetToken(email);
    }

    public void resetPassword(ResetPasswordRequest req) {
        boolean ok = passwordResetService.resetPassword(req.getToken(), req.getNewPassword());
        if (!ok) {
            throw new IllegalArgumentException("Token inválido ou expirado");
        }
    }
}
