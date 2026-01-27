package com.projetomilhas.backend.service;

import com.projetomilhas.backend.dto.dashboard.CreditoPrevistoResponse;
import com.projetomilhas.backend.dto.dashboard.DashboardResumoResponse;
import com.projetomilhas.backend.entity.Purchase;
import com.projetomilhas.backend.entity.PurchaseStatus;
import com.projetomilhas.backend.entity.UserEntity;
import com.projetomilhas.backend.repository.PurchaseRepository;
import com.projetomilhas.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final PurchaseRepository purchaseRepository;

    public DashboardService(UserRepository userRepository,
                            PurchaseRepository purchaseRepository) {
        this.userRepository = userRepository;
        this.purchaseRepository = purchaseRepository;
    }

    // ---------------------- RESUMO PRINCIPAL ----------------------
    public DashboardResumoResponse getResumo(String email) {

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        List<Purchase> purchases = purchaseRepository.findByUserId(user.getId());

        long totalPontos = purchases.stream()
                .filter(p -> p.getStatus() == PurchaseStatus.CREDITED)
                .mapToLong(Purchase::getPointsGenerated)
                .sum();

        long comprasPendentes = purchases.stream()
                .filter(p -> p.getStatus() == PurchaseStatus.PENDING)
                .count();

        List<CreditoPrevistoResponse> proximos = purchases.stream()
                .filter(p -> p.getStatus() == PurchaseStatus.PENDING)
                .filter(p -> p.getExpectedCreditDate() != null)
                .filter(p -> p.getExpectedCreditDate().isAfter(LocalDateTime.now()))
                .sorted(Comparator.comparing(Purchase::getExpectedCreditDate))
                .limit(5)
                .map(CreditoPrevistoResponse::fromPurchase)
                .collect(Collectors.toList());

        return new DashboardResumoResponse(
                totalPontos,
                comprasPendentes,
                proximos
        );
    }

    // ---------------------- AGRUPAR PONTOS POR PROGRAMA ----------------------
    public List<Map<String, Object>> getPontosPorPrograma(String email) {

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        List<Object[]> totals = purchaseRepository
                .sumPointsByProgramForUserAndStatus(user.getId(), PurchaseStatus.CREDITED);

        return totals.stream().map(row -> {
            Map<String, Object> m = new HashMap<>();
            m.put("programId", row[0]);
            m.put("programName", row[1]);
            m.put("pontos", row[2]);
            return m;
        }).collect(Collectors.toList());
    }
}
