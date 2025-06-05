package com.example.backend.repositories;

import com.example.backend.models.LigneCaisse
import org.springframework.data.jpa.repository.JpaRepository

interface LigneCaisseRepository : JpaRepository<LigneCaisse, Int> {
}
