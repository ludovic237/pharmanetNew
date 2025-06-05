package com.example.backend.repositories;

import com.example.backend.models.LigneCommande
import org.springframework.data.jpa.repository.JpaRepository

interface LigneCommandeRepository : JpaRepository<LigneCommande, Int> {
}
