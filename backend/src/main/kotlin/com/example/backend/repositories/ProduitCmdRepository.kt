package com.example.backend.repositories;

import com.example.backend.models.ProduitCmd
import org.springframework.data.jpa.repository.JpaRepository

interface ProduitCmdRepository : JpaRepository<ProduitCmd, Int> {
}
