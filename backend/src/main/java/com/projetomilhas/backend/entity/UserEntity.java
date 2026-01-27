package com.projetomilhas.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "users",
        indexes = {
                @Index(name = "idx_user_email", columnList = "email")
        }
)
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 120)
    private String name;

    @Column(nullable = false, unique = true, length = 180)
    private String email;

    @JsonIgnore
    @Column(nullable = false, length = 255)
    private String password;

    @OneToMany(mappedBy = "user", orphanRemoval = false)
    private List<Card> cards = new ArrayList<>();

    @OneToMany(mappedBy = "user", orphanRemoval = false)
    private List<Purchase> purchases = new ArrayList<>();

    @Version
    private Long version;

    public void setName(String name) {
        this.name = name == null ? null : name.trim();
    }

    public void setEmail(String email) {
        this.email = email == null ? null : email.trim().toLowerCase();
    }

    public void addCard(Card card) {
        if (card == null) return;
        cards.add(card);
        card.setUser(this);
    }

    public void removeCard(Card card) {
        if (card == null) return;
        cards.remove(card);
        card.setUser(null);
    }

    public void addPurchase(Purchase p) {
        if (p == null) return;
        purchases.add(p);
        p.setUser(this);
    }

    public void removePurchase(Purchase p) {
        if (p == null) return;
        purchases.remove(p);
        p.setUser(null);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserEntity)) return false;
        UserEntity other = (UserEntity) o;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "UserEntity{id=" + id + ", name='" + name + "', email='" + email + "'}";
    }
}
