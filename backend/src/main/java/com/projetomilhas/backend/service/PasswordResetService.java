package com.projetomilhas.backend.service;

import com.projetomilhas.backend.entity.PasswordResetToken;
import com.projetomilhas.backend.entity.UserEntity;
import com.projetomilhas.backend.repository.PasswordResetTokenRepository;
import com.projetomilhas.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetService(PasswordResetTokenRepository tokenRepository,
                                UserRepository userRepository,
                                PasswordEncoder passwordEncoder) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public String createPasswordResetToken(String email) {
        Optional<UserEntity> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return null; // não revela nada ao usuário
        }

        UserEntity user = userOpt.get();

        tokenRepository.deleteByUserId(user.getId());

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken =
                new PasswordResetToken(token, LocalDateTime.now().plusHours(24), user);

        tokenRepository.save(resetToken);

        return token;  // agora o controller devolve pro frontend
    }

    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> opt = tokenRepository.findByToken(token);

        if (opt.isEmpty()) {
            return false;
        }

        PasswordResetToken t = opt.get();

        if (t.getExpiryDate().isBefore(LocalDateTime.now())) {
            return false;
        }

        UserEntity user = t.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        tokenRepository.delete(t);

        return true;
    }
}
