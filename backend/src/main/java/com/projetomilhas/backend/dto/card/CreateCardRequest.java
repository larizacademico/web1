package com.projetomilhas.backend.dto.card;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateCardRequest {

    @NotBlank(message = "O nome do cartão é obrigatório")
    @Size(max = 100)
    private String name;

    @NotNull(message = "O limite é obrigatório")
    @Positive(message = "O limite deve ser maior que zero")
    private Double limit;

    @NotBlank(message = "A bandeira é obrigatória")
    @Size(max = 50)
    private String brand;

    @NotBlank(message = "O tipo é obrigatório")
    @Size(max = 50)
    private String type;

    // ESSENCIAL pro cálculo automático
    @NotNull(message = "A pontuação do cartão é obrigatória")
    @Positive(message = "A pontuação deve ser maior que zero")
    private Double pointsPerDollar;

    @NotEmpty(message = "Selecione pelo menos um programa")
    private List<@Positive Long> programIds;
}
