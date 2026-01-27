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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ProtectedEndpointsIT {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper mapper;

    String token;

    @BeforeEach
    void setUp() throws Exception {
        // Cadastrar usuário
        String signup = """
        {
          "name": "User Test",
          "email": "user@example.com",
          "password": "123456"
        }
        """;

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(signup))
                .andExpect(status().isCreated());

        // Login para obter token
        String login = """
        {
          "email": "user@example.com",
          "password": "123456"
        }
        """;

        String resp = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(login))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn()
                .getResponse()
                .getContentAsString();

        token = mapper.readTree(resp).get("token").asText();
    }

    @Test
    void rotaProtegidaSemToken_deveDar403() throws Exception {
        // CORREÇÃO: Espera 403 (Forbidden) em vez de 401
        mockMvc.perform(get("/api/cards"))
                .andExpect(status().isForbidden());  // 403
    }

    @Test
    void rotaProtegidaComToken_deveDar200() throws Exception {
        mockMvc.perform(get("/api/cards")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void rotaProtegidaComTokenInvalido_deveDar403() throws Exception {
        mockMvc.perform(get("/api/cards")
                        .header("Authorization", "Bearer token_invalido_123"))
                .andExpect(status().isForbidden());  // 403
    }

    @Test
    void pingDeveSerPublico() throws Exception {
        mockMvc.perform(get("/ping"))
                .andExpect(status().isOk())
                .andExpect(content().string("pong"));
    }
}