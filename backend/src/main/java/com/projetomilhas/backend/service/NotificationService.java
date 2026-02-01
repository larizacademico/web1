package com.projetomilhas.backend.service;

import com.projetomilhas.backend.entity.Notification;
import com.projetomilhas.backend.entity.UserEntity;
import com.projetomilhas.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repository;

    // ✅ Método chamado pelo PURCHASE SERVICE para criar o alerta
    public void criarNotificacao(String titulo, String mensagem, UserEntity user) {
        Notification n = new Notification();
        n.setTitle(titulo);
        n.setMessage(mensagem);
        n.setUser(user);
        // A data (createdAt) e o status (read=false) são definidos automaticamente na Entidade

        repository.save(n);
    }

    // ✅ Método chamado pelo CONTROLLER para mostrar na tela
    public List<Notification> listarPorUsuario(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // ✅ Método chamado pelo CONTROLLER para marcar como lida
    public void marcarComoLida(Long id) {
        repository.findById(id).ifPresent(n -> {
            n.setRead(true); // O Lombok gera o setRead se o campo for boolean
            repository.save(n);
        });
    }
}