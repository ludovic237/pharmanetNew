package com.example.backend.repositories;

import com.example.backend.models.Depense
import org.springframework.data.jpa.repository.JpaRepository

interface DepenseRepository : JpaRepository<Depense, Int> {
}
