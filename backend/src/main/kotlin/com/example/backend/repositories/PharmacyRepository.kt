package com.example.backend.repositories;

import com.example.backend.models.Pharmacy
import org.springframework.data.jpa.repository.JpaRepository

interface PharmacyRepository : JpaRepository<Pharmacy, Int> {
}
