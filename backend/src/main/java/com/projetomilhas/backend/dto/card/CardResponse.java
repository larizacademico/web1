package com.projetomilhas.backend.dto.card;

import com.projetomilhas.backend.entity.Card;
import lombok.*;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CardResponse {

    private Long id;
    private String name;
    private String brand;
    private String type;

    // 1. ADICIONEI O CAMPO LIMITE AQUI
    private Double limit;

    private List<Long> programIds;
    private List<String> programNames;

    public static CardResponse fromEntity(Card c) {
        List<Long> ids = c.getPrograms().stream().map(p -> p.getId()).collect(Collectors.toList());
        List<String> names = c.getPrograms().stream().map(p -> p.getName()).collect(Collectors.toList());

        return new CardResponse(
                c.getId(),
                c.getName(),
                c.getBrand(),
                c.getType(),

                // 2. ADICIONEI AQUI PARA PEGAR O VALOR DO BANCO
                c.getLimit(),

                ids,
                names
        );
    }
}