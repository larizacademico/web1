package com.projetomilhas.backend.repository;

import com.projetomilhas.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Busca todas as notificações de um usuário específico, da mais nova para a mais velha
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
}