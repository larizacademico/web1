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

    // Listar notificações do usuário
    public List<Notification> listarPorUsuario(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // Marcar como lida
    public void marcarComoLida(Long id) {
        repository.findById(id).ifPresent(n -> {
            n.setRead(true);
            repository.save(n);
        });
    }

    // Método para CRIAR notificação (usaremos isso quando salvar uma compra)
    public void criarNotificacao(String titulo, String mensagem, UserEntity user) {
        Notification n = new Notification();
        n.setTitle(titulo);
        n.setMessage(mensagem);
        n.setUser(user);
        repository.save(n);
    }
}