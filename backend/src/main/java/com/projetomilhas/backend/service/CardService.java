package com.projetomilhas.backend.service;

import com.projetomilhas.backend.dto.card.CardResponse;
import com.projetomilhas.backend.dto.card.CreateCardRequest;
import com.projetomilhas.backend.entity.Card;
import com.projetomilhas.backend.entity.Program;
import com.projetomilhas.backend.entity.UserEntity;
import com.projetomilhas.backend.repository.CardRepository;
import com.projetomilhas.backend.repository.ProgramRepository;
import com.projetomilhas.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CardService {

    private final CardRepository cardRepository;
    private final UserRepository userRepository;
    private final ProgramRepository programRepository;

    public CardService(CardRepository cardRepository,
                       UserRepository userRepository,
                       ProgramRepository programRepository) {
        this.cardRepository = cardRepository;
        this.userRepository = userRepository;
        this.programRepository = programRepository;
    }

    // --------------------- LISTA CARTÕES DO USUÁRIO ---------------------
    public List<CardResponse> list(String userEmail) {
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        return cardRepository.findByUserIdWithPrograms(user.getId())
                .stream()
                .map(CardResponse::fromEntity)
                .toList();
    }

    // ----------------------- CRIA NOVO CARTÃO ---------------------------
    public CardResponse create(CreateCardRequest req, String userEmail) {

        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Card card = new Card();
        card.setName(req.getName());

        // --- AQUI ESTAVA FALTANDO! ---
        // Passa o limite que veio do Frontend para o Banco de Dados
        card.setLimit(req.getLimit());
        // -----------------------------

        card.setBrand(req.getBrand());
        card.setType(req.getType());
        card.setUser(user);

        if (req.getProgramIds() != null) {
            req.getProgramIds().forEach(pid -> {
                Program p = programRepository.findById(pid)
                        .orElseThrow(() -> new RuntimeException("Programa não encontrado: " + pid));
                card.addProgram(p);
            });
        }

        Card saved = cardRepository.save(card);

        return CardResponse.fromEntity(saved);
    }
    // ADICIONE ESTE MÉTODO NO FINAL DO CardService
    public void delete(Long id) {
        if (cardRepository.existsById(id)) {
            cardRepository.deleteById(id);
        } else {
            throw new RuntimeException("Cartão não encontrado para exclusão");
        }
    }
    // ADICIONE ESTE MÉTODO NO FINAL DO CardService
    public CardResponse update(Long id, CreateCardRequest req) {
        Card card = cardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cartão não encontrado"));

        // Atualiza os dados
        card.setName(req.getName());
        card.setLimit(req.getLimit());
        card.setBrand(req.getBrand());
        card.setType(req.getType());

        // Se quiser atualizar os programas de milhas também, a lógica seria mais complexa,
        // mas para nome e limite, isso basta.

        cardRepository.save(card); // O save no JPA serve tanto para criar quanto para atualizar
        return CardResponse.fromEntity(card);
    }
}