package com.projetomilhas.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CardControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper mapper;

    private String token;

    @BeforeEach
    void setUpUserAndToken() throws Exception {

        String signupJson = """
            {
              "name": "card-user",
              "email": "card-user@test.local",
              "password": "senha123"
            }
            """;

        // Tenta cadastrar. Se já existir, apenas ignora.
        try {
            mockMvc.perform(post("/api/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(signupJson))
                    .andExpect(status().isCreated());
        } catch (AssertionError ignored) {
            // Usuário já existe → ok, seguimos
        }

        String loginJson = """
            {
              "email": "card-user@test.local",
              "password": "senha123"
            }
            """;

        String resp = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode node = mapper.readTree(resp);
        this.token = node.get("token").asText();

        assertThat(this.token).isNotBlank();
    }

    @Test
    void deveCriarEListarCartaoComAutenticacao() throws Exception {

        String createCardJson = """
            {
              "name": "Meu Visa",
              "brand": "Visa",
              "type": "Credito"
            }
            """;

        // criar cartão
        mockMvc.perform(post("/api/cards")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createCardJson))
                .andExpect(status().isOk());

        // listar cartões
        String respList = mockMvc.perform(get("/api/cards")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode arr = mapper.readTree(respList);
        assertThat(arr.isArray()).isTrue();
    }

    @Test
    void rotaCartoesSemToken_deveDar403() throws Exception {
        mockMvc.perform(get("/api/cards"))
                .andExpect(status().isForbidden());
    }
}
