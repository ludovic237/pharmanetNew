package com.example.backend.repositories;

import com.example.backend.models.TypeDepense
import org.springframework.data.jpa.repository.JpaRepository

interface TypeDepenseRepository : JpaRepository<TypeDepense, Int> {
}
