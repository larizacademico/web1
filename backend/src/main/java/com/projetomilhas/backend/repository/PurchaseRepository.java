package com.projetomilhas.backend.repository;

import com.projetomilhas.backend.entity.Purchase;
import com.projetomilhas.backend.entity.PurchaseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    // Busca global
    List<Purchase> findByStatus(PurchaseStatus status);

    // Busca tudo de um usuário
    List<Purchase> findByUserId(Long userId);

    // Busca apenas o que está pendente DESTE usuário específico
    List<Purchase> findByUserIdAndStatus(Long userId, PurchaseStatus status);

    // Busca compras pendentes vencidas
    List<Purchase> findByStatusAndExpectedCreditDateLessThanEqual(PurchaseStatus status, LocalDateTime dateTime);

    // Soma de pontos por programa (Dashboard)
    @Query("SELECT p.program.id, p.program.name, SUM(p.pointsGenerated) " +
            "FROM Purchase p " +
            "WHERE p.user.id = :userId AND p.status = :status " +
            "GROUP BY p.program.id, p.program.name")
    List<Object[]> sumPointsByProgramForUserAndStatus(@Param("userId") Long userId,
                                                      @Param("status") PurchaseStatus status);

    // ✅ NOVO: Soma todos os gastos feitos neste cartão
    // O COALESCE garante que retorne 0 se não houver compras, evitando erro de NULL
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Purchase p WHERE p.card.id = :cardId")
    Double somarGastosPorCartao(@Param("cardId") Long cardId);
}