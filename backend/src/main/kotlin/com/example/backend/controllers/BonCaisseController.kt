package com.example.backend.controllers

        import com.example.backend.models.BonCaisse
        import com.example.backend.services.BonCaisseService
        import org.springframework.http.ResponseEntity
        import org.springframework.web.bind.annotation.*

data class BonCaisseData(
  val nomClient: String,
  val montant: Int
)
        @RestController
        @RequestMapping("/api/admin/bons")
        class BonCaisseController(
            private val bonCaisseService: BonCaisseService
        ) {

            @GetMapping
            fun getAllBons(): ResponseEntity<List<BonCaisse>> {
                return ResponseEntity.ok(bonCaisseService.getAllBons())
            }

            @GetMapping("/{id}")
            fun getBonById(@PathVariable id: Int): ResponseEntity<BonCaisse> {
                return ResponseEntity.ok(bonCaisseService.getBonById(id))
            }

            @GetMapping("/codebarre/{codebarreId}")
            fun getBonByCodebarreId(@PathVariable codebarreId: String): ResponseEntity<BonCaisse?> {
                return ResponseEntity.ok(bonCaisseService.getBonByCodebarreId(codebarreId))
            }

            @PostMapping
            fun createBon(@RequestBody bon: BonCaisseData): ResponseEntity<BonCaisse> {
                return ResponseEntity.ok(bonCaisseService.createBon(bon))
            }

            @PutMapping("/{codebarreId}")
            fun updateBon(@PathVariable codebarreId: String): ResponseEntity<BonCaisse> {
              return ResponseEntity.ok(bonCaisseService.updateBon(codebarreId))
            }

            @DeleteMapping("/{id}")
            fun deleteBon(@PathVariable id: Int): ResponseEntity<Void> {
                bonCaisseService.deleteBon(id)
                return ResponseEntity.noContent().build()
            }
        }
