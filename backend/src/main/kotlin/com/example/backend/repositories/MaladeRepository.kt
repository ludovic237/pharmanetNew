package com.example.backend.repositories;

import com.example.backend.models.Malade
import org.springframework.data.jpa.repository.JpaRepository

interface MaladeRepository : JpaRepository<Malade, Int> {
}
