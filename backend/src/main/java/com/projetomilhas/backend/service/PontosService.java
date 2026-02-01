package com.projetomilhas.backend.service;

import com.projetomilhas.backend.entity.Card;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class PontosService {

    public long calcularPontos(Double amount, Card card) {
        if (amount == null || amount < 0) {
            throw new IllegalArgumentException("Valor da compra não pode ser negativo.");
        }
        if (card == null) {
            throw new IllegalArgumentException("Cartão é obrigatório para cálculo de pontos.");
        }

        Double ppd = card.getPointsPerDollar();
        if (ppd == null || ppd <= 0) {
            // fallback: se você quiser permitir, use 1.0
            throw new IllegalArgumentException("Pontos por dólar do cartão inválido.");
        }

        double base = amount * ppd;

        double fatorTipo = fatorPorTipo(card.getType());
        double fatorBandeira = fatorPorBandeira(card.getBrand());

        double pontos = base * fatorTipo * fatorBandeira;

        return Math.round(pontos);
    }

    private double fatorPorTipo(String type) {
        if (type == null) return 1.0;
        String t = type.toLowerCase(Locale.ROOT);

        // Ajuste esses valores como quiser (só seja consistente)
        if (t.contains("black") || t.contains("infinite")) return 1.30;
        if (t.contains("platinum")) return 1.20;
        if (t.contains("gold")) return 1.10;
        if (t.contains("internacional")) return 1.05;
        if (t.contains("nacional")) return 1.00;

        return 1.0;
    }

    private double fatorPorBandeira(String brand) {
        if (brand == null) return 1.0;
        String b = brand.toLowerCase(Locale.ROOT);

        // Pode ser tudo 1.0 se você não quiser “favorecer” bandeira.
        // O importante é: está usando a bandeira no cálculo.
        if (b.contains("visa")) return 1.05;
        if (b.contains("master")) return 1.04;
        if (b.contains("elo")) return 1.03;
        if (b.contains("american")) return 1.06;
        if (b.contains("hiper")) return 1.02;

        return 1.0;
    }
}
