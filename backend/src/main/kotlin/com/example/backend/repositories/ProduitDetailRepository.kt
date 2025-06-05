package com.example.backend.repositories;

import com.example.backend.models.ProduitDetail
import org.springframework.data.jpa.repository.JpaRepository

interface ProduitDetailRepository : JpaRepository<ProduitDetail, Int> {
}
