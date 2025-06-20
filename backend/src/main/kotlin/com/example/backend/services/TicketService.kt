package com.example.backend.services

import com.example.backend.models.TicketCaisse
import com.example.backend.repositories.TicketCaisseRepository
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Service
class TicketCaisseService(
    private val ticketCaisseRepository: TicketCaisseRepository
) {

    fun getAllTickets(): List<TicketCaisse> {
        return ticketCaisseRepository.findAll()
    }

    fun getTicketById(id: Int): TicketCaisse {
        return ticketCaisseRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Ticket with ID $id not found") }
    }

    fun getTicketByCodebarre(codebarre: Int): TicketCaisse? {
        return ticketCaisseRepository.findByCodebarre(codebarre)
    }

fun createTicket(ticket: TicketCaisse): TicketCaisse {
    val dateCode = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMddHHmmss"))
    ticket.codebarre = dateCode.toIntOrNull() ?: throw IllegalArgumentException("Failed to generate codebarre")
    ticket.dateGenere = LocalDate.now()
    ticket.supprimer = 0
    return ticketCaisseRepository.save(ticket)
}

    fun updateTicket(id: Int, updatedTicket: TicketCaisse): TicketCaisse {
        val existingTicket = ticketCaisseRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Ticket with ID $id not found") }

        existingTicket.codebarre = updatedTicket.codebarre
        existingTicket.montant = updatedTicket.montant
        existingTicket.statut = updatedTicket.statut
        existingTicket.validite = updatedTicket.validite
        return ticketCaisseRepository.save(existingTicket)
    }

    fun deleteTicket(id: Int) {
        val ticket = ticketCaisseRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Ticket with ID $id not found") }
        ticket.supprimer = 1
        ticketCaisseRepository.save(ticket)
    }
}
