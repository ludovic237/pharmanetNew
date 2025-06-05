package com.example.backend.repositories;

import com.example.backend.models.Facturation
import org.springframework.data.jpa.repository.JpaRepository

interface FacturationRepository : JpaRepository<Facturation, Long> {
}
