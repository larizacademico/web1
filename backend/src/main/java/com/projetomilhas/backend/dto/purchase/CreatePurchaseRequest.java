package com.projetomilhas.backend.dto.purchase;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePurchaseRequest {

    @NotNull
    private Long cardId;

    @NotNull
    @Positive
    private Double amount;

    private String description;

    @NotNull(message = "É necessário informar o programId que receberá os pontos")
    private Long programId;
}
