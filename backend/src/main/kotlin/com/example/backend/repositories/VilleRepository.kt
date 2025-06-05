package com.example.backend.repositories;

import com.example.backend.models.Ville
import org.springframework.data.jpa.repository.JpaRepository

interface VilleRepository : JpaRepository<Ville, Int> {
}
