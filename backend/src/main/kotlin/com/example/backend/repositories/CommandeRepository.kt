package com.example.backend.repositories;

import com.example.backend.models.Commande
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface CommandeRepository : JpaRepository<Commande, Long> {

  @Query("SELECT COUNT(c) FROM Commande c WHERE c.supprimer = 0 AND MONTH(c.dateCreation) = MONTH(CURRENT_DATE) AND YEAR(c.dateCreation) = YEAR(CURRENT_DATE)")
  fun countMois(): Long

}
