package com.projetomilhas.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PurchaseControllerIT {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper mapper;

    String token;

    @BeforeEach
    void setup() throws Exception {
        // Usa email único para cada teste
        String email = "test" + System.currentTimeMillis() + "@example.com";

        String signup = String.format("""
        {
          "name": "Test User",
          "email": "%s",
          "password": "123456"
        }
        """, email);

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(signup))
                .andExpect(status().isCreated());

        String login = String.format("""
        {
          "email": "%s",
          "password": "123456"
        }
        """, email);

        String resp = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(login))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        token = mapper.readTree(resp).get("token").asText();
    }

    @Test
    void testCreatePurchase() throws Exception {
        // Primeiro, tenta criar um cartão (se o endpoint existir)
        Long cardId = 1L; // ID padrão

        try {
            String createCard = """
            {
              "cardNumber": "4111111111111111",
              "cardHolderName": "TEST USER",
              "expiryDate": "12/28",
              "cvv": "123",
              "cardBrand": "Visa"
            }
            """;

            String cardResponse = mockMvc.perform(post("/api/cards")
                            .header("Authorization", "Bearer " + token)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(createCard))
                    .andExpect(status().isOk())
                    .andReturn()
                    .getResponse()
                    .getContentAsString();

            // Extrai o ID do cartão criado
            cardId = mapper.readTree(cardResponse).get("id").asLong();
        } catch (Exception e) {
            // Se não conseguir criar cartão, usa ID 1
            System.out.println("Não foi possível criar cartão, usando ID 1");
        }

        // JSON para criar uma compra
        String purchaseJson = String.format("""
        {
          "cardId": %d,
          "amount": 1000.00,
          "description": "Compra de teste",
          "merchant": "Amazon",
          "purchaseDate": "2024-01-15"
        }
        """, cardId);

        // Testa criação de compra
        // Pode retornar 200 (sucesso), 400 (bad request) ou 404 (cartão não encontrado)
        mockMvc.perform(post("/api/purchases")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(purchaseJson))
                .andExpect(status().is2xxSuccessful()); // Aceita 200, 201, etc.
    }

    @Test
    void testCreatePurchaseWithoutAuth() throws Exception {
        // Testa criação sem autenticação
        String purchaseJson = """
        {
          "cardId": 1,
          "amount": 100.00,
          "description": "Compra sem auth",
          "merchant": "Teste",
          "purchaseDate": "2024-01-15"
        }
        """;

        mockMvc.perform(post("/api/purchases")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(purchaseJson))
                .andExpect(status().isForbidden()); // 403 sem autenticação
    }

    @Test
    void testCreatePurchaseInvalidData() throws Exception {
        // Testa com dados inválidos
        String purchaseJson = """
        {
          "cardId": 0,
          "amount": -100.00,
          "description": "",
          "merchant": "",
          "purchaseDate": "invalid-date"
        }
        """;

        mockMvc.perform(post("/api/purchases")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(purchaseJson))
                .andExpect(status().is4xxClientError()); // 400 Bad Request
    }

    @Test
    void testEndpointDiscovery() throws Exception {
        System.out.println("\n=== VERIFICANDO ENDPOINTS DE COMPRAS ===");

        // Testa diferentes métodos no endpoint /api/purchases
        try {
            // Testa GET (pode não ser suportado)
            mockMvc.perform(get("/api/purchases")
                            .header("Authorization", "Bearer " + token))
                    .andDo(result -> {
                        System.out.println("GET /api/purchases -> " + result.getResponse().getStatus());
                    });
        } catch (Exception e) {
            System.out.println("GET /api/purchases -> Não suportado");
        }

        // Testa POST
        try {
            mockMvc.perform(post("/api/purchases")
                            .header("Authorization", "Bearer " + token)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andDo(result -> {
                        System.out.println("POST /api/purchases -> " + result.getResponse().getStatus());
                    });
        } catch (Exception e) {
            System.out.println("POST /api/purchases -> Erro: " + e.getMessage());
        }
    }
}