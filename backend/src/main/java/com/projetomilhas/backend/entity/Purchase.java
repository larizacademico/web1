package com.projetomilhas.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Objects;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "purchases")
public class Purchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "card_id", nullable = false)
    private Card card;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;

    @Column(nullable = false)
    private Double amount;

    @Column(length = 1000)
    private String description;

    @Column(name = "purchase_date", nullable = false)
    private LocalDateTime purchaseDate;

    @Column(name = "expected_credit_date")
    private LocalDateTime expectedCreditDate;

    @Column(nullable = false)
    private Long pointsGenerated = 0L;

    @Column(name = "receipt_path")
    private String receiptPath;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PurchaseStatus status = PurchaseStatus.PENDING;

    @Version
    private Long version;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @PrePersist
    protected void prePersist() {
        if (this.purchaseDate == null) this.purchaseDate = LocalDateTime.now();
    }

    public void setAmount(Double amount) {
        if (amount == null || amount < 0)
            throw new IllegalArgumentException("amount deve ser >= 0");
        this.amount = amount;
    }

    public void setProgram(Program program) {
        if (program == null)
            throw new IllegalArgumentException("program não pode ser nulo");
        this.program = program;
    }

    public void setCard(Card card) {
        if (card == null)
            throw new IllegalArgumentException("card não pode ser nulo");
        this.card = card;
    }

    public void setUser(UserEntity user) {
        if (user == null)
            throw new IllegalArgumentException("user não pode ser nulo");
        this.user = user;
    }

    public void setPointsGenerated(Long pointsGenerated) {
        if (pointsGenerated == null || pointsGenerated < 0)
            throw new IllegalArgumentException("pointsGenerated deve ser >= 0");
        this.pointsGenerated = pointsGenerated;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Purchase)) return false;
        Purchase other = (Purchase) o;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "Purchase{id=" + id + ", amount=" + amount + ", status=" + status + "}";
    }
}
