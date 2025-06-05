package com.example.backend.repositories;

import com.example.backend.models.Produit
import org.springframework.data.jpa.repository.JpaRepository

interface ProduitRepository : JpaRepository<Produit, Int> {
}
