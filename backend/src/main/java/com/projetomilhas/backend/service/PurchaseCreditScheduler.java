package com.projetomilhas.backend.service;

import com.projetomilhas.backend.entity.Purchase;
import com.projetomilhas.backend.entity.PurchaseStatus;
import com.projetomilhas.backend.repository.PurchaseRepository;
import com.projetomilhas.backend.service.PurchaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PurchaseCreditScheduler {

    private final PurchaseRepository purchaseRepository;
    private final PurchaseService purchaseService;

    @Scheduled(fixedDelay = 300_000)
    public void creditarPendentesVencidas() {
        List<Purchase> vencidas = purchaseRepository
                .findByStatusAndExpectedCreditDateLessThanEqual(
                        PurchaseStatus.PENDING,
                        LocalDateTime.now()
                );

        for (Purchase p : vencidas) {
            purchaseService.credit(p.getId(), p.getUser().getId());
        }
    }
}
