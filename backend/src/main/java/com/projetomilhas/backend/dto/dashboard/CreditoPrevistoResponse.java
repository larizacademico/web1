package com.projetomilhas.backend.dto.dashboard;

import com.projetomilhas.backend.entity.Purchase;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreditoPrevistoResponse {

    private Long id;
    private String descricao;
    private Double valor;
    private Long pontos;
    private LocalDateTime dataCredito;

    public static CreditoPrevistoResponse fromPurchase(Purchase p) {
        return new CreditoPrevistoResponse(
                p.getId(),
                p.getDescription(),
                p.getAmount(),
                p.getPointsGenerated(),
                p.getExpectedCreditDate()
        );
    }
}
