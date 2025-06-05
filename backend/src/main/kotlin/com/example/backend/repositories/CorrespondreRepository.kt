package com.example.backend.repositories;

import com.example.backend.models.Correspondre
import org.springframework.data.jpa.repository.JpaRepository

interface CorrespondreRepository : JpaRepository<Correspondre, Int> {
}
