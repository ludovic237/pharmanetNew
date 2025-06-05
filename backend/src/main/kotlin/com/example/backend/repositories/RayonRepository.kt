package com.example.backend.repositories;

import com.example.backend.models.Rayon
import org.springframework.data.jpa.repository.JpaRepository

interface RayonRepository : JpaRepository<Rayon, Int> {
}
