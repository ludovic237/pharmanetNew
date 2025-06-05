package com.example.backend.repositories;

import com.example.backend.models.Commande
import org.springframework.data.jpa.repository.JpaRepository

interface CommandeRepository : JpaRepository<Commande, Long> {
}
