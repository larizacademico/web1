package com.projetomilhas.backend.dto.purchase;

import com.projetomilhas.backend.entity.Purchase;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PurchaseResponse {

    private Long id;
    private String description;
    private Double amount;

    private Long pointsGenerated;
    private String status;

    private Long cardId;
    private String cardName;

    private Long programId;
    private String programName;

    private LocalDateTime createdAt;
    private LocalDateTime expectedCreditDate;

    public static PurchaseResponse fromEntity(Purchase p) {
        PurchaseResponse r = new PurchaseResponse();

        r.setId(p.getId());
        r.setDescription(p.getDescription());
        r.setAmount(p.getAmount());
        r.setPointsGenerated(p.getPointsGenerated());
        r.setStatus(p.getStatus().name());

        if (p.getCard() != null) {
            r.setCardId(p.getCard().getId());
            r.setCardName(p.getCard().getName());
        }

        if (p.getProgram() != null) {
            r.setProgramId(p.getProgram().getId());
            r.setProgramName(p.getProgram().getName());
        }

        r.setCreatedAt(p.getCreatedAt());
        r.setExpectedCreditDate(p.getExpectedCreditDate());

        return r;
    }
}
