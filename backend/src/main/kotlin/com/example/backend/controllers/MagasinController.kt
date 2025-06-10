package com.example.backend.controllers

  import com.example.backend.models.Magasin
  import com.example.backend.services.MagasinService
  import org.springframework.http.HttpStatus
  import org.springframework.http.ResponseEntity
  import org.springframework.web.bind.annotation.*

  @RestController
  @RequestMapping("/api/magasins")
  class MagasinController(private val magasinService: MagasinService) {

      @PostMapping
      fun createMagasin(@RequestBody magasin: Magasin): ResponseEntity<Magasin> =
          ResponseEntity.status(HttpStatus.CREATED).body(magasinService.createMagasin(magasin))

      @GetMapping
      fun getAllMagasins(): ResponseEntity<List<Magasin>> =
          ResponseEntity.ok(magasinService.getAllMagasins())

      @PutMapping("/{id}")
      fun updateMagasin(@PathVariable id: Int, @RequestBody magasin: Magasin): ResponseEntity<Magasin> =
          ResponseEntity.ok(magasinService.updateMagasin(id, magasin))

      @DeleteMapping("/{id}")
      fun deleteMagasin(@PathVariable id: Int): ResponseEntity<Void> {
          magasinService.deleteMagasin(id)
          return ResponseEntity.noContent().build()
      }
  }
