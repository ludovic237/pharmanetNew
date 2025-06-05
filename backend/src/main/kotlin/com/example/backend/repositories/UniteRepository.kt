package com.example.backend.repositories;

import com.example.backend.models.Unite
import org.springframework.data.jpa.repository.JpaRepository

interface UniteRepository : JpaRepository<Unite, Int> {
}
