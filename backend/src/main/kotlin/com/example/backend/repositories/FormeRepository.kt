package com.example.backend.repositories;

import com.example.backend.models.Forme
import org.springframework.data.jpa.repository.JpaRepository

interface FormeRepository : JpaRepository<Forme, Int> {
}
