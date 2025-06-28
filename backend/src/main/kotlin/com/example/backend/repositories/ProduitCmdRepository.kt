package com.example.backend.repositories;

import com.example.backend.models.Commande
import com.example.backend.models.Produit
import com.example.backend.models.ProduitCmd
import org.springframework.data.jpa.repository.JpaRepository

interface ProduitCmdRepository : JpaRepository<ProduitCmd, Int> {
  fun findByCommandeId(commandeId: Long): List<ProduitCmd>
  fun findByCommandeAndProduit(commande: Commande,produit: Produit): ProduitCmd
  fun findByCommandeIdAndId(commandeId: Long,id:Int): ProduitCmd
}
