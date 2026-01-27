package com.projetomilhas.backend.dto.dashboard;

import lombok.Getter;
import lombok.AllArgsConstructor;
import java.util.List;

@Getter
@AllArgsConstructor
public class DashboardResumoResponse {

    private final long totalPontos;
    private final long comprasPendentes;
    private final List<CreditoPrevistoResponse> proximosCreditos;

}
