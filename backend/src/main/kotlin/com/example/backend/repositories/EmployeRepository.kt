package com.example.backend.repositories;

import com.example.backend.models.Employe
import org.springframework.data.jpa.repository.JpaRepository

interface EmployeRepository : JpaRepository<Employe, Int> {
}
