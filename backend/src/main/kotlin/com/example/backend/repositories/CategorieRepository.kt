package com.example.backend.repositories;

import com.example.backend.models.Categorie
import org.springframework.data.jpa.repository.JpaRepository

interface CategorieRepository : JpaRepository<Categorie, Int> {
}
