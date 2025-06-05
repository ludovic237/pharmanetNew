package com.example.backend.repositories;

import com.example.backend.models.Fournisseur
import org.springframework.data.jpa.repository.JpaRepository

interface FournisseurRepository : JpaRepository<Fournisseur, Int> {
}
