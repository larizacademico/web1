package com.projetomilhas.backend.dto.dashboard;

import lombok.*;

@Getter
@AllArgsConstructor
public class PontosPorCartaoResponse {

    private final String cartao;
    private final Long pontos;

}
