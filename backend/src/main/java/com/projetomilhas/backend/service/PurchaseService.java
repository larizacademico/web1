package com.projetomilhas.backend.service;

import com.projetomilhas.backend.dto.purchase.CreatePurchaseRequest;
import com.projetomilhas.backend.dto.purchase.PurchaseResponse;
import com.projetomilhas.backend.entity.*;
import com.projetomilhas.backend.repository.CardRepository;
import com.projetomilhas.backend.repository.ProgramRepository;
import com.projetomilhas.backend.repository.PurchaseRepository;
import com.projetomilhas.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final UserRepository userRepository;
    private final CardRepository cardRepository;
    private final ProgramRepository programRepository;
    private final PontosService pontosService;
    private final NotificationService notificationService;

    // --------- CREATE ----------
    @Transactional
    public PurchaseResponse create(CreatePurchaseRequest request, Long userId, String imageUrl) {

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));

        Card card = cardRepository.findById(request.getCardId())
                .orElseThrow(() -> new EntityNotFoundException("Cartão não encontrado"));

        if (!card.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Cartão não pertence ao usuário.");
        }

        // =================================================================================
        // NOVA VALIDAÇÃO DE LIMITE
        Double totalGasto = purchaseRepository.somarGastosPorCartao(card.getId());
        Double valorNovaCompra = request.getAmount();
        Double limiteCartao = card.getLimit();

        if ((totalGasto + valorNovaCompra) > limiteCartao) {
            Double disponivel = limiteCartao - totalGasto;
            throw new IllegalArgumentException("Compra recusada! Limite insuficiente. Disponível: R$ " + disponivel);
        }
        // =================================================================================


        // Lógica do Programa de Fidelidade
        Program program;
        if (request.getProgramId() != null) {
            program = programRepository.findById(request.getProgramId())
                    .orElseThrow(() -> new EntityNotFoundException("Programa não encontrado"));

            if (!card.getPrograms().contains(program)) {
                throw new IllegalArgumentException("Este cartão não está vinculado a este programa.");
            }
        } else {
            if (card.getPrograms() == null || card.getPrograms().isEmpty()) {
                throw new IllegalArgumentException("O cartão selecionado não possui nenhum programa de milhas.");
            }
            program = card.getPrograms().get(0);
        }

        Purchase purchase = new Purchase();
        purchase.setUser(user);
        purchase.setCard(card);
        purchase.setProgram(program);
        purchase.setAmount(request.getAmount());
        purchase.setDescription(request.getDescription());
        purchase.setReceiptPath(imageUrl);
        purchase.setStatus(PurchaseStatus.PENDING);

        long pontosGerados = pontosService.calcularPontos(request.getAmount(), card);
        purchase.setPointsGenerated(pontosGerados);


        // Linha original (DESATIVADA TEMPORARIAMENTE):
        // LocalDateTime creditDate = LocalDateTime.now().plusDays(program.getDefaultCreditDays());

        // Linha de Teste (ATIVA - Define a data para 1 minuto atrás):
        LocalDateTime creditDate = LocalDateTime.now().minusMinutes(1);

        purchase.setExpectedCreditDate(creditDate);

        purchaseRepository.save(purchase);

        // Notificação de Sucesso
        String titulo = "Compra em Análise 🕒";
        String msg = "Sua compra de R$ " + request.getAmount() + " gerou " + pontosGerados + " pontos (Pendentes).";
        notificationService.criarNotificacao(titulo, msg, user);

        return PurchaseResponse.fromEntity(purchase);
    }

    // --------- GET BY ID ----------
    @Transactional(readOnly = true)
    public PurchaseResponse getById(Long id, Long userId) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Compra não encontrada"));

        if (!purchase.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("A compra não pertence ao usuário.");
        }
        return PurchaseResponse.fromEntity(purchase);
    }

    // --------- LIST ----------
    @Transactional(readOnly = true)
    public List<PurchaseResponse> listByUser(Long userId) {
        return purchaseRepository.findByUserId(userId)
                .stream()
                .map(PurchaseResponse::fromEntity)
                .toList();
    }

    // --------- DELETE ----------
    @Transactional
    public void delete(Long id, Long userId) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Compra não encontrada"));
        if (!purchase.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("A compra não pertence ao usuário.");
        }
        purchaseRepository.delete(purchase);
    }

    // --------- UPDATE ----------
    @Transactional
    public PurchaseResponse update(Long id, CreatePurchaseRequest request, Long userId) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Compra não encontrada"));

        if (!purchase.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("A compra não pertence ao usuário.");
        }

        purchase.setDescription(request.getDescription());
        purchase.setAmount(request.getAmount());

        purchaseRepository.save(purchase);
        return PurchaseResponse.fromEntity(purchase);
    }

    // --------- CREDIT ----------
    @Transactional
    public PurchaseResponse credit(Long purchaseId, Long userId) {
        Purchase purchase = purchaseRepository.findById(purchaseId)
                .orElseThrow(() -> new EntityNotFoundException("Compra não encontrada"));

        if (!purchase.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("A compra não pertence ao usuário.");
        }

        if (purchase.getStatus() == PurchaseStatus.CREDITED) {
            return PurchaseResponse.fromEntity(purchase);
        }

        purchase.setStatus(PurchaseStatus.CREDITED);

        Program program = purchase.getProgram();
        long novoSaldo = program.getBalance() + purchase.getPointsGenerated();
        program.setBalance(novoSaldo);

        programRepository.save(program);
        purchaseRepository.save(purchase);

        String titulo = "Pontos Creditados! ✈️";
        String msg = "Parabéns! " + purchase.getPointsGenerated() + " pontos foram adicionados ao programa " + program.getName() + ".";
        notificationService.criarNotificacao(titulo, msg, purchase.getUser());

        return PurchaseResponse.fromEntity(purchase);
    }
}