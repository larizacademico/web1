package com.projetomilhas.backend.service;

import com.projetomilhas.backend.dto.card.CardResponse;
import com.projetomilhas.backend.dto.card.CreateCardRequest;
import com.projetomilhas.backend.entity.Card;
import com.projetomilhas.backend.entity.Program;
import com.projetomilhas.backend.entity.UserEntity;
import com.projetomilhas.backend.repository.CardRepository;
import com.projetomilhas.backend.repository.ProgramRepository;
import com.projetomilhas.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CardService {

    private final CardRepository cardRepository;
    private final ProgramRepository programRepository;
    private final UserRepository userRepository;

    public CardService(CardRepository cardRepository,
                       ProgramRepository programRepository,
                       UserRepository userRepository) {
        this.cardRepository = cardRepository;
        this.programRepository = programRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<CardResponse> list(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        // ajuste se seu repo for diferente
        return cardRepository.findByUserId(user.getId())
                .stream()
                .map(CardResponse::fromEntity)
                .toList();
    }

    @Transactional
    public CardResponse create(CreateCardRequest req, String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        Card c = new Card();
        c.setUser(user);
        apply(req, c);

        Card saved = cardRepository.save(c);
        return CardResponse.fromEntity(saved);
    }

    @Transactional
    public CardResponse update(Long id, CreateCardRequest req, String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        Card c = cardRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cartão não encontrado"));

        // garante que só o dono mexe
        if (!c.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não pode alterar este cartão");
        }

        apply(req, c);

        Card saved = cardRepository.save(c);
        return CardResponse.fromEntity(saved);
    }

    @Transactional
    public void delete(Long id, String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        Card c = cardRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cartão não encontrado"));

        if (!c.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não pode excluir este cartão");
        }

        cardRepository.delete(c);
    }

    private void apply(CreateCardRequest req, Card c) {
        c.setName(req.getName());
        c.setLimit(req.getLimit());
        c.setBrand(req.getBrand());
        c.setType(req.getType());
        c.setPointsPerDollar(req.getPointsPerDollar());

        // re-vincula programas
        c.getPrograms().clear();

        List<Program> programs = programRepository.findAllById(req.getProgramIds());
        if (programs.size() != req.getProgramIds().size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Programa inválido na lista");
        }

        programs.forEach(c::addProgram);
    }
}
