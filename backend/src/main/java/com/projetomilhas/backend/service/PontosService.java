package com.projetomilhas.backend.service;

import org.springframework.stereotype.Service;

@Service
public class PontosService {

    public long calcularPontos(Double amount, Double multiplier) {

        if (amount == null || amount < 0) {
            throw new IllegalArgumentException("Valor da compra não pode ser negativo.");
        }

        if (multiplier == null || multiplier <= 0) {
            throw new IllegalArgumentException("Multiplier inválido.");
        }

        double pontos = amount * multiplier;

        return Math.round(pontos);
    }
}
