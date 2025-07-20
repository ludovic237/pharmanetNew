package com.example.backend.repositories;

import com.example.backend.models.EnRayon
import com.example.backend.models.Inventaire
import com.example.backend.models.ProduitInventaire
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository

interface ProduitInventaireRepository : JpaRepository<ProduitInventaire, Int> {

  fun findByInventaire(inventaire: Inventaire): List<ProduitInventaire>
  fun findByInventaire(inventaire: Inventaire, pageable: Pageable): Page<ProduitInventaire>
  fun findByInventaireAndEnRayon(inventaire: Inventaire, enRayon: EnRayon): ProduitInventaire?
//  fun findByInventaireExistsAndEnRayonExists(inventaire: Inventaire, enRayon: EnRayon): Boolean
//  fun findByInventaireAndEnRayon(inventaire: Inventaire, enRayon: EnRayon): ProduitInventaire

}
