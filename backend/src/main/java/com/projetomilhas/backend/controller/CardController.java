package com.projetomilhas.backend.controller;

import com.projetomilhas.backend.dto.card.CardResponse;
import com.projetomilhas.backend.dto.card.CreateCardRequest;
import com.projetomilhas.backend.service.CardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/cards")
public class CardController {

    private final CardService cardService;

    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    // LISTAR CARTÕES
    @GetMapping
    public ResponseEntity<List<CardResponse>> list(Principal principal) {
        return ResponseEntity.ok(cardService.list(principal.getName()));
    }

    // CRIAR CARTÃO
    @PostMapping
    public ResponseEntity<CardResponse> create(@RequestBody CreateCardRequest req,
                                               Principal principal) {
        return ResponseEntity.ok(cardService.create(req, principal.getName()));
    }

    // DELETAR CARTÃO (Novo!)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        cardService.delete(id);
        // Retorna 204 No Content (sucesso, mas sem nada para mostrar na resposta)
        return ResponseEntity.noContent().build();
    }
    // ADICIONE ISSO NO CardController

    @PutMapping("/{id}")
    public ResponseEntity<CardResponse> update(@PathVariable Long id, @RequestBody CreateCardRequest req) {
        return ResponseEntity.ok(cardService.update(id, req));
    }
}