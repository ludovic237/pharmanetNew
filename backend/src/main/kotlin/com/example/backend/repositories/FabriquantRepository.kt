package com.example.backend.repositories;

import com.example.backend.models.Fabriquant
import org.springframework.data.jpa.repository.JpaRepository

interface FabriquantRepository : JpaRepository<Fabriquant, Int> {
}
