package com.projetomilhas.backend.controller;

import com.projetomilhas.backend.dto.card.CardResponse;
import com.projetomilhas.backend.dto.card.CreateCardRequest;
import com.projetomilhas.backend.service.CardService;
import jakarta.validation.Valid;
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

    @GetMapping
    public ResponseEntity<List<CardResponse>> list(Principal principal) {
        return ResponseEntity.ok(cardService.list(principal.getName()));
    }

    @PostMapping
    public ResponseEntity<CardResponse> create(@Valid @RequestBody CreateCardRequest req,
                                               Principal principal) {
        return ResponseEntity.ok(cardService.create(req, principal.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CardResponse> update(@PathVariable Long id,
                                               @Valid @RequestBody CreateCardRequest req,
                                               Principal principal) {
        return ResponseEntity.ok(cardService.update(id, req, principal.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Principal principal) {
        cardService.delete(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
