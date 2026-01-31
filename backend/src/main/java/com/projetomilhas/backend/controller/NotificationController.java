package com.projetomilhas.backend.controller;

import com.projetomilhas.backend.entity.Notification;
import com.projetomilhas.backend.entity.UserEntity;
import com.projetomilhas.backend.repository.UserRepository;
import com.projetomilhas.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService service;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Notification>> listar(Principal principal) {
        // Pega o usuário logado
        UserEntity user = userRepository.findByEmail(principal.getName()).orElseThrow();
        return ResponseEntity.ok(service.listarPorUsuario(user.getId()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> marcarLida(@PathVariable Long id) {
        service.marcarComoLida(id);
        return ResponseEntity.noContent().build();
    }
}