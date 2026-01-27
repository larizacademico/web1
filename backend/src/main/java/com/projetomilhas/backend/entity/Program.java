package com.projetomilhas.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "programs", indexes = {
        @Index(name = "idx_program_name", columnList = "name")
})
public class Program {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100, unique = true)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private Long balance = 0L;

    @Column(name = "default_credit_days", nullable = false)
    private Integer defaultCreditDays = 30;

    @Column(nullable = false)
    private Double multiplier = 1.0;

    @Version
    private Long version;

    @ManyToMany(mappedBy = "programs", fetch = FetchType.LAZY)
    private List<Card> cards = new ArrayList<>();

    // ------- Regras mantidas ---------

    public void setBalance(Long balance) {
        if (balance == null || balance < 0)
            throw new IllegalArgumentException("Balance não pode ser nulo ou negativo.");
        this.balance = balance;
    }

    public void setDefaultCreditDays(Integer defaultCreditDays) {
        if (defaultCreditDays == null || defaultCreditDays <= 0)
            throw new IllegalArgumentException("defaultCreditDays deve ser maior que zero.");
        this.defaultCreditDays = defaultCreditDays;
    }

    public void setMultiplier(Double multiplier) {
        if (multiplier == null || multiplier <= 0)
            throw new IllegalArgumentException("Multiplier deve ser maior que zero.");
        this.multiplier = multiplier;
    }

    public void setCards(List<Card> newCards) {
        for (Card existing : new ArrayList<>(this.cards)) {
            if (newCards == null || !newCards.contains(existing)) {
                existing.getPrograms().remove(this);
                this.cards.remove(existing);
            }
        }
        if (newCards != null) {
            for (Card c : newCards) {
                if (!this.cards.contains(c)) {
                    this.cards.add(c);
                    if (!c.getPrograms().contains(this)) {
                        c.getPrograms().add(this);
                    }
                }
            }
        }
    }

    public void addCard(Card card) {
        if (card == null) return;
        if (!cards.contains(card)) cards.add(card);
        if (!card.getPrograms().contains(this)) card.getPrograms().add(this);
    }

    public void removeCard(Card card) {
        if (card == null) return;
        cards.remove(card);
        card.getPrograms().remove(this);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Program)) return false;
        Program other = (Program) o;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
