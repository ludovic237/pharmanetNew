package com.example.backend.repositories;

import com.example.backend.models.Concerner
import org.springframework.data.jpa.repository.JpaRepository

interface ConcernerRepository : JpaRepository<Concerner, Int> {
}
