package com.projetomilhas.backend.dto.card;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateCardRequest {

    @NotBlank(message = "O nome do cartão é obrigatório")
    @Size(max = 100)
    private String name;

    // --- ADICIONE ISTO AQUI ---
    // Aceita o valor do limite (pode ser null se não for obrigatório,
    // mas se for obrigatório use @NotNull)
    @Positive(message = "O limite deve ser maior que zero")
    private Double limit;
    // --------------------------

    @Size(max = 50)
    private String brand;

    @Size(max = 50)
    private String type;

    private List<@Positive Long> programIds;
}