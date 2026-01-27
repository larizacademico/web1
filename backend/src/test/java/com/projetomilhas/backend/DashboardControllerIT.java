package com.projetomilhas.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class DashboardControllerIT {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper mapper;

    String token;

    @BeforeEach
    void login() throws Exception {
        String signup = """
        {
          "name": "DashUser",
          "email": "dash@example.com",
          "password": "123456"
        }
        """;

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(signup))
                .andExpect(status().isCreated()); // 201

        String login = """
        {
          "email": "dash@example.com",
          "password": "123456"
        }
        """;

        String resp = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(login))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        token = mapper.readTree(resp).get("token").asText();
    }

    @Test
    void dashboardResumo_deveRetornar200() throws Exception {
        mockMvc.perform(get("/api/dashboard/resumo")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }
}
