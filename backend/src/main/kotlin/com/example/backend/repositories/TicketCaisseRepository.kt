package com.example.backend.repositories;

import com.example.backend.models.TicketCaisse
import org.springframework.data.jpa.repository.JpaRepository

interface TicketCaisseRepository : JpaRepository<TicketCaisse, Int> {
}
