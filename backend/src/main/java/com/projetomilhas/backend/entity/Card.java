package com.projetomilhas.backend.entity;

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
@Table(name = "cards")
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "card_limit")
    private Double limit;

    // --- CAMPO NOVO PARA CÁLCULO ---
    @Column(name = "points_per_dollar")
    private Double pointsPerDollar;
    // -------------------------------

    @Column(length = 50)
    private String brand;

    @Column(length = 50)
    private String type;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "card_programs",
            joinColumns = @JoinColumn(name = "card_id"),
            inverseJoinColumns = @JoinColumn(name = "program_id")
    )
    private List<Program> programs = new ArrayList<>();

    public void setName(String name) { this.name = name == null ? null : name.trim(); }
    public void setBrand(String brand) { this.brand = brand == null ? null : brand.trim(); }
    public void setType(String type) { this.type = type == null ? null : type.trim(); }

    public void addProgram(Program program) {
        if (program == null) return;
        if (!programs.contains(program)) programs.add(program);
        if (!program.getCards().contains(this)) program.getCards().add(this);
    }

    public void removeProgram(Program program) {
        if (program == null) return;
        programs.remove(program);
        program.getCards().remove(this);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Card)) return false;
        Card other = (Card) o;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() { return Objects.hashCode(id); }
    @Override
    public String toString() { return "Card{id=" + id + ", name='" + name + "'}"; }
}