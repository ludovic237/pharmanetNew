package com.example.backend.repositories;

import com.example.backend.models.ProduitRetour
import org.springframework.data.jpa.repository.JpaRepository

interface ProduitRetourRepository : JpaRepository<ProduitRetour, Int> {
}
