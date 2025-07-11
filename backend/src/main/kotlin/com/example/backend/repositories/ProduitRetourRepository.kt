package com.example.backend.repositories;

import com.example.backend.models.ProduitRetour
import com.example.backend.models.RetourProduit
import org.springframework.data.jpa.repository.JpaRepository

interface ProduitRetourRepository : JpaRepository<ProduitRetour, Int> {

    fun findByRetourProduitId(retourProduitId: Long): List<ProduitRetour>
    fun findByRetourProduitIn(retourProduit: List<RetourProduit>): List<ProduitRetour>
}
