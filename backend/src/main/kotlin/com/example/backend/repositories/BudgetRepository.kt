package com.example.backend.repositories;

import com.example.backend.models.Budget
import org.springframework.data.jpa.repository.JpaRepository

interface BudgetRepository : JpaRepository<Budget, Int> {
}
