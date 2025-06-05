package com.example.backend.repositories;

import com.example.backend.models.SortieStock
import org.springframework.data.jpa.repository.JpaRepository

interface SortieStockRepository : JpaRepository<SortieStock, Int> {
}
