package com.example.backend.controllers

import com.example.backend.models.Rayon
import com.example.backend.services.RayonService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/rayons")
class RayonController(private val rayonService: RayonService) {

    @PostMapping
    fun createRayon(@RequestBody rayon: Rayon): ResponseEntity<Rayon> =
        ResponseEntity.status(HttpStatus.CREATED).body(rayonService.createRayon(rayon))

    @GetMapping
    fun getAllRayons(): ResponseEntity<List<Rayon>> =
        ResponseEntity.ok(rayonService.getAllRayons())

    @PutMapping("/{id}")
    fun updateRayon(@PathVariable id: Int, @RequestBody rayon: Rayon): ResponseEntity<Rayon> =
        ResponseEntity.ok(rayonService.updateRayon(id, rayon))

    @DeleteMapping("/{id}")
    fun deleteRayon(@PathVariable id: Int): ResponseEntity<Void> {
        rayonService.deleteRayon(id)
        return ResponseEntity.noContent().build()
    }
}
