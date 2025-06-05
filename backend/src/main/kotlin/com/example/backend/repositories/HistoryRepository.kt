package com.example.backend.repositories;

import com.example.backend.models.History
import org.springframework.data.jpa.repository.JpaRepository

interface HistoryRepository : JpaRepository<History, Int> {
}
