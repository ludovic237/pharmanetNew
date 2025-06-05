package com.example.backend.repositories;

import com.example.backend.models.Employe
import com.example.backend.models.User
import org.springframework.data.jpa.repository.JpaRepository

interface EmployeRepository : JpaRepository<Employe, Int> {
  fun findByUser(user: User) :Employe
}
