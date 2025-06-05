package com.example.backend.repositories;

import com.example.backend.models.FactureTicket
import org.springframework.data.jpa.repository.JpaRepository

interface FactureTicketRepository : JpaRepository<FactureTicket, Int> {
}
