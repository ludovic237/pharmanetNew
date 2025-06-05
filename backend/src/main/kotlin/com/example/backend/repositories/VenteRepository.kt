package com.example.backend.repositories;

import com.example.backend.models.Vente
import org.springframework.data.jpa.repository.JpaRepository

interface VenteRepository : JpaRepository<Vente, Long> {
}
