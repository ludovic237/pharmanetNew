package com.example.backend.repositories;

import com.example.backend.models.EnRayon
import org.springframework.data.jpa.repository.JpaRepository

interface EnRayonRepository : JpaRepository<EnRayon, String> {
}
