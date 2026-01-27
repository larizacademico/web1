package com.projetomilhas.backend.repository;

import com.projetomilhas.backend.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CardRepository extends JpaRepository<Card, Long> {

    List<Card> findByUserId(Long userId);

    Optional<Card> findByIdAndUserId(Long id, Long userId);

    @Query("select c from Card c left join fetch c.programs p where c.id = :id")
    Optional<Card> findByIdWithPrograms(@Param("id") Long id);

    @Query("select c from Card c left join fetch c.programs p where c.user.id = :userId")
    List<Card> findByUserIdWithPrograms(@Param("userId") Long userId);
}
