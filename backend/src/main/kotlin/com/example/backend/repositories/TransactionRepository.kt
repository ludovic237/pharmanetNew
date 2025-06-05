package com.example.backend.repositories;

import com.example.backend.models.Transaction
import org.springframework.data.jpa.repository.JpaRepository

interface TransactionRepository : JpaRepository<Transaction, Int> {
}
