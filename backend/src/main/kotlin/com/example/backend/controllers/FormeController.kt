package com.example.backend.controllers

import com.example.backend.models.Forme
import com.example.backend.services.FormeService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/formes")
class FormeController(private val formeService: FormeService) {

    @PostMapping
    fun createForme(@RequestBody forme: Forme): ResponseEntity<Forme> =
        ResponseEntity.status(HttpStatus.CREATED).body(formeService.createForme(forme))

    @GetMapping
    fun getAllFormes(): ResponseEntity<List<Forme>> =
        ResponseEntity.ok(formeService.getAllFormes())

    @PutMapping("/{id}")
    fun updateForme(@PathVariable id: Int, @RequestBody forme: Forme): ResponseEntity<Forme> =
        ResponseEntity.ok(formeService.updateForme(id, forme))

    @DeleteMapping("/{id}")
    fun deleteForme(@PathVariable id: Int): ResponseEntity<Void> {
        formeService.deleteForme(id)
        return ResponseEntity.noContent().build()
    }
}
