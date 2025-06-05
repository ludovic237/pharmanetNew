package com.example.backend.repositories;

import com.example.backend.models.ProduitInventaire
import org.springframework.data.jpa.repository.JpaRepository

interface ProduitInventaireRepository : JpaRepository<ProduitInventaire, Int> {
}
