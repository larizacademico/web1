package com.projetomilhas.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.projetomilhas.backend.dto.auth.AuthRequest;
import com.projetomilhas.backend.dto.user.SignupRequest;
import com.projetomilhas.backend.repository.CardRepository;
import com.projetomilhas.backend.repository.ProgramRepository;
import com.projetomilhas.backend.repository.PurchaseRepository;
import com.projetomilhas.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private ProgramRepository programRepository;

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private ObjectMapper objectMapper;


    @BeforeEach
    void limparBanco() {
        purchaseRepository.deleteAll();
        cardRepository.deleteAll();
        programRepository.deleteAll();
        userRepository.deleteAll();
    }


    @Test
    void deveRegistrarUsuarioComSucesso() throws Exception {

        SignupRequest signup = new SignupRequest();
        signup.setName("Teste");
        signup.setEmail("teste@example.com");
        signup.setPassword("123456");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signup)))
                .andExpect(status().isCreated());
    }


    @Test
    void deveLogarUsuarioComSucesso() throws Exception {

        SignupRequest signup = new SignupRequest();
        signup.setName("Teste Login");
        signup.setEmail("login@example.com");
        signup.setPassword("123456");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signup)))
                .andExpect(status().isCreated());

        AuthRequest login = new AuthRequest();
        login.setEmail("login@example.com");
        login.setPassword("123456");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }
}
