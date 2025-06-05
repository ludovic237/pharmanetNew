package com.example.backend.repositories;

import com.example.backend.models.RetourProduit
import org.springframework.data.jpa.repository.JpaRepository

interface RetourProduitRepository : JpaRepository<RetourProduit, Int> {
}
