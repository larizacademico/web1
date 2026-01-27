package com.projetomilhas.backend;

import com.projetomilhas.backend.service.PontosService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class PontosServiceTest {

    private final PontosService pontosService = new PontosService();

    @Test
    void calcularPontos_ComValorPositivo_DeveRetornarCorreto() {
        long resultado = pontosService.calcularPontos(100.0, 2.0);
        assertEquals(200L, resultado); // <-- ERA int, agora long
    }

    @Test
    void calcularPontos_ComValorDecimal_DeveArredondar() {
        long resultado = pontosService.calcularPontos(10.7, 1.5);
        assertEquals(16L, resultado); // <-- ERA int
    }

    @Test
    void calcularPontos_MultiplierMaior_DeveRetornarCorreto() {
        long resultado = pontosService.calcularPontos(50.0, 3.0);
        assertEquals(150L, resultado); // <-- ERA int
    }

    @Test
    void calcularPontos_ComValorNegativo_DeveLancarExcecao() {
        assertThrows(IllegalArgumentException.class,
                () -> pontosService.calcularPontos(-10.0, 2.0));
    }

    @Test
    void calcularPontos_ComMultiplierInvalido_DeveLancarExcecao() {
        assertThrows(IllegalArgumentException.class,
                () -> pontosService.calcularPontos(10.0, 0.0));
    }
}
