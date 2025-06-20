package com.example.backend.controllers

import com.example.backend.models.TicketCaisse
import com.example.backend.services.TicketCaisseService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin/tickets")
class TicketCaisseController(
    private val ticketCaisseService: TicketCaisseService
) {

    @GetMapping
    fun getAllTickets(): ResponseEntity<List<TicketCaisse>> {
        return ResponseEntity.ok(ticketCaisseService.getAllTickets())
    }

    @GetMapping("/{id}")
    fun getTicketById(@PathVariable id: Int): ResponseEntity<TicketCaisse> {
        return ResponseEntity.ok(ticketCaisseService.getTicketById(id))
    }

    @GetMapping("/codebarre/{codebarre}")
    fun getTicketByCodebarre(@PathVariable codebarre: Int): ResponseEntity<TicketCaisse?> {
        return ResponseEntity.ok(ticketCaisseService.getTicketByCodebarre(codebarre))
    }

    @PostMapping
    fun createTicket(@RequestBody ticket: TicketCaisse): ResponseEntity<TicketCaisse> {
        return ResponseEntity.ok(ticketCaisseService.createTicket(ticket))
    }

    @PutMapping("/{id}")
    fun updateTicket(@PathVariable id: Int, @RequestBody updatedTicket: TicketCaisse): ResponseEntity<TicketCaisse> {
        return ResponseEntity.ok(ticketCaisseService.updateTicket(id, updatedTicket))
    }

    @DeleteMapping("/{id}")
    fun deleteTicket(@PathVariable id: Int): ResponseEntity<Void> {
        ticketCaisseService.deleteTicket(id)
        return ResponseEntity.noContent().build()
    }
}
