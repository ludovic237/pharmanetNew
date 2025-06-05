package com.example.backend.repositories;

import com.example.backend.models.EnRayonInventaire
import org.springframework.data.jpa.repository.JpaRepository

interface EnRayonInventaireRepository : JpaRepository<EnRayonInventaire, Long> {
}
