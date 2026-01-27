package com.projetomilhas.backend.controller;

import com.projetomilhas.backend.dto.user.UpdateProfileRequest;
import com.projetomilhas.backend.dto.user.UserDto;
import com.projetomilhas.backend.entity.UserEntity;
import com.projetomilhas.backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/me")
    public UserDto getMe(Authentication auth) {
        String email = auth.getName();
        UserEntity u = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return UserDto.fromEntity(u);
    }

    @PutMapping("/me")
    public UserDto updateMe(Authentication auth, @Valid @RequestBody UpdateProfileRequest req) {
        String emailToken = auth.getName();

        UserEntity u = userRepository.findByEmail(emailToken)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        u.setName(req.getName());
        u.setEmail(req.getEmail());

        if (req.getNewPassword() != null && !req.getNewPassword().isBlank()) {
            if (req.getCurrentPassword() == null || req.getCurrentPassword().isBlank()) {
                throw new RuntimeException("Informe a senha atual.");
            }
            if (!passwordEncoder.matches(req.getCurrentPassword(), u.getPassword())) {
                throw new RuntimeException("Senha atual incorreta.");
            }
            u.setPassword(passwordEncoder.encode(req.getNewPassword()));
        }

        return UserDto.fromEntity(userRepository.save(u));
    }
}
