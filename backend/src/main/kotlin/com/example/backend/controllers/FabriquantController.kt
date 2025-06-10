package com.example.backend.controllers

import com.example.backend.models.Fabriquant
import com.example.backend.services.FabriquantService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/fabriquants")
class FabriquantController(private val fabriquantService: FabriquantService) {

    @PostMapping
    fun createFabriquant(@RequestBody fabriquant: Fabriquant): ResponseEntity<Fabriquant> =
        ResponseEntity.status(HttpStatus.CREATED).body(fabriquantService.createFabriquant(fabriquant))

    @GetMapping
    fun getAllFabriquants(): ResponseEntity<List<Fabriquant>> =
        ResponseEntity.ok(fabriquantService.getAllFabriquants())

    @PutMapping("/{id}")
    fun updateFabriquant(@PathVariable id: Int, @RequestBody fabriquant: Fabriquant): ResponseEntity<Fabriquant> =
        ResponseEntity.ok(fabriquantService.updateFabriquant(id, fabriquant))

    @DeleteMapping("/{id}")
    fun deleteFabriquant(@PathVariable id: Int): ResponseEntity<Void> {
        fabriquantService.deleteFabriquant(id)
        return ResponseEntity.noContent().build()
    }
}
