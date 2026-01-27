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

    // Busca global (Cuidado: traz dados de outros usuários)
    List<Purchase> findByStatus(PurchaseStatus status);

    // Busca tudo de um usuário
    List<Purchase> findByUserId(Long userId);

    // Busca apenas o que está pendente DESTE usuário específico
    List<Purchase> findByUserIdAndStatus(Long userId, PurchaseStatus status);

    // Busca compras pendentes cujo prazo de crédito já venceu (útil para alertas / scheduler)
    List<Purchase> findByStatusAndExpectedCreditDateLessThanEqual(PurchaseStatus status, LocalDateTime dateTime);

    @Query("SELECT p.program.id, p.program.name, SUM(p.pointsGenerated) " +
            "FROM Purchase p " +
            "WHERE p.user.id = :userId AND p.status = :status " +
            "GROUP BY p.program.id, p.program.name")
    List<Object[]> sumPointsByProgramForUserAndStatus(@Param("userId") Long userId,
                                                      @Param("status") PurchaseStatus status);
}
