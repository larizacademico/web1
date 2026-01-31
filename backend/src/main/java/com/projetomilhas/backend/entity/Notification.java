package com.projetomilhas.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "tb_notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String message;

    private boolean isRead = false; // Começa como não lida

    private LocalDateTime createdAt = LocalDateTime.now(); // Data automática

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity user; // Liga a notificação ao usuário dono dela
}