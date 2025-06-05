package com.example.backend.repositories;

import com.example.backend.models.Inventaire
import org.springframework.data.jpa.repository.JpaRepository

interface InventaireRepository : JpaRepository<Inventaire, Int> {
}
