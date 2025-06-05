package com.example.backend.repositories;

import com.example.backend.models.ProduitVendu
import org.springframework.data.jpa.repository.JpaRepository

interface ProduitVenduRepository : JpaRepository<ProduitVendu, Int> {
}
