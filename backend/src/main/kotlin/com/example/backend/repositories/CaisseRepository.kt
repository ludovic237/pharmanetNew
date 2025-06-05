package com.example.backend.repositories;

import com.example.backend.models.Caisse
import org.springframework.data.jpa.repository.JpaRepository

interface CaisseRepository : JpaRepository<Caisse, Int> {
}
