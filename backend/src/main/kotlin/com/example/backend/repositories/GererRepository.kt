package com.example.backend.repositories;

import com.example.backend.models.Gerer
import org.springframework.data.jpa.repository.JpaRepository

interface GererRepository : JpaRepository<Gerer, Long> {
}
