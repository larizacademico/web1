package com.projetomilhas.backend.controller;

import com.projetomilhas.backend.dto.purchase.CreatePurchaseRequest;
import com.projetomilhas.backend.dto.purchase.PurchaseResponse;
import com.projetomilhas.backend.entity.UserEntity;
import com.projetomilhas.backend.repository.UserRepository;
import com.projetomilhas.backend.service.FileStorageService;
import com.projetomilhas.backend.service.PurchaseService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/purchases")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PurchaseController {

    private final PurchaseService purchaseService;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PurchaseResponse> create(
            @RequestParam("cardId") Long cardId,
            @RequestParam("description") String description,
            @RequestParam("amount") Double amount,
            @RequestParam(value = "programId", required = false) Long programId,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Principal principal) {

        String email = principal.getName();
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));

        String path = null;
        if (file != null && !file.isEmpty()) {
            path = fileStorageService.storeFile(file);
        }

        CreatePurchaseRequest request = new CreatePurchaseRequest();
        request.setCardId(cardId);
        request.setDescription(description);
        request.setAmount(amount);
        request.setProgramId(programId);

        return ResponseEntity.ok(
                purchaseService.create(request, user.getId(), path)
        );
    }

    @GetMapping
    public ResponseEntity<List<PurchaseResponse>> list(Principal principal) {
        UserEntity user = userRepository.findByEmail(principal.getName()).orElseThrow();
        return ResponseEntity.ok(purchaseService.listByUser(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseResponse> getById(@PathVariable Long id, Principal principal) {
        UserEntity user = userRepository.findByEmail(principal.getName()).orElseThrow();
        return ResponseEntity.ok(purchaseService.getById(id, user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Principal principal) {
        UserEntity user = userRepository.findByEmail(principal.getName()).orElseThrow();
        purchaseService.delete(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    // Credita manualmente uma compra e atualiza o saldo do programa.
    @PatchMapping("/{id}/creditar")
    public ResponseEntity<PurchaseResponse> creditar(@PathVariable Long id, Principal principal) {
        UserEntity user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));
        return ResponseEntity.ok(purchaseService.credit(id, user.getId()));
    }
}
