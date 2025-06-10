package com.example.backend.controllers

import com.example.backend.models.Categorie
import com.example.backend.services.CategorieService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/categories")
class CategorieController(private val categorieService: CategorieService) {

    @PostMapping
    fun createCategorie(@RequestBody categorie: Categorie): ResponseEntity<Categorie> =
        ResponseEntity.status(HttpStatus.CREATED).body(categorieService.createCategorie(categorie))

    @GetMapping
    fun getAllCategories(): ResponseEntity<List<Categorie>> =
        ResponseEntity.ok(categorieService.getAllCategories())

    @PutMapping("/{id}")
    fun updateCategorie(@PathVariable id: Int, @RequestBody categorie: Categorie): ResponseEntity<Categorie> =
        ResponseEntity.ok(categorieService.updateCategorie(id, categorie))

    @DeleteMapping("/{id}")
    fun deleteCategorie(@PathVariable id: Int): ResponseEntity<Void> {
        categorieService.deleteCategorie(id)
        return ResponseEntity.noContent().build()
    }
}
