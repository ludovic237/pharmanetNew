package com.example.backend.repositories;

import com.example.backend.models.CodePostal
import org.springframework.data.jpa.repository.JpaRepository

interface CodePostalRepository : JpaRepository<CodePostal, Int> {
}
