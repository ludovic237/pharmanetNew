package com.example.backend.repositories;

import com.example.backend.models.FactureEspece
import com.example.backend.models.FactureTicket
import org.springframework.data.jpa.repository.JpaRepository

interface FactureTicketRepository : JpaRepository<FactureTicket, Int> {
  fun findByFacturationId(facturationId: Long): FactureTicket
}
