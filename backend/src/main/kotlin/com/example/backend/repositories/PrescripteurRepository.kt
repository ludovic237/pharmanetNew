package com.example.backend.repositories;

import com.example.backend.models.Prescripteur
import org.springframework.data.jpa.repository.JpaRepository

interface PrescripteurRepository : JpaRepository<Prescripteur, Int> {
}
