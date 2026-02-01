package com.projetomilhas.backend;

import com.projetomilhas.backend.entity.Card;
import com.projetomilhas.backend.service.PontosService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class PontosServiceTest {

    private final PontosService pontosService = new PontosService();

    private Card card(String brand, String type, double pointsPerDollar) {
        Card c = new Card();
        c.setBrand(brand);
        c.setType(type);
        c.setPointsPerDollar(pointsPerDollar);
        return c;
    }

    @Test
    void calcularPontos_ComValorPositivo_DeveRetornarCorreto() {
        // base = 100 * 2 = 200
        // tipo Platinum => 1.20
        // bandeira Visa => 1.05
        // 200 * 1.20 * 1.05 = 252
        Card card = card("Visa", "Platinum", 2.0);

        long resultado = pontosService.calcularPontos(100.0, card);
        assertEquals(252L, resultado);
    }

    @Test
    void calcularPontos_ComValorDecimal_DeveArredondar() {
        // base = 10.7 * 1.5 = 16.05
        // tipo Nacional => 1.00
        // bandeira Elo => 1.03
        // 16.05 * 1.03 = 16.5315 -> arredonda 17
        Card card = card("Elo", "Nacional", 1.5);

        long resultado = pontosService.calcularPontos(10.7, card);
        assertEquals(17L, resultado);
    }

    @Test
    void calcularPontos_TipoBlack_DeveAplicarFatorMaior() {
        // base = 50 * 3 = 150
        // tipo Black/Infinite => 1.30
        // bandeira Mastercard => 1.04
        // 150 * 1.30 * 1.04 = 202.8 -> 203
        Card card = card("Mastercard", "Black/Infinite", 3.0);

        long resultado = pontosService.calcularPontos(50.0, card);
        assertEquals(203L, resultado);
    }

    @Test
    void calcularPontos_ComValorNegativo_DeveLancarExcecao() {
        Card card = card("Visa", "Platinum", 2.0);

        assertThrows(IllegalArgumentException.class,
                () -> pontosService.calcularPontos(-10.0, card));
    }

    @Test
    void calcularPontos_ComCartaoNulo_DeveLancarExcecao() {
        assertThrows(IllegalArgumentException.class,
                () -> pontosService.calcularPontos(10.0, null));
    }

    @Test
    void calcularPontos_ComPointsPerDollarInvalido_DeveLancarExcecao() {
        Card card = card("Visa", "Platinum", 0.0);

        assertThrows(IllegalArgumentException.class,
                () -> pontosService.calcularPontos(10.0, card));
    }
}
