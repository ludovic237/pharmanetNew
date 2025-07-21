package com.example.backend.controllers

import com.example.backend.dtos.CaisseClotureRequestDto
import com.example.backend.dtos.CaisseOuvertureRequestDto
import com.example.backend.repositories.EmployeRepository
import com.example.backend.repositories.UserRepository
import com.example.backend.services.CaisseException
import com.example.backend.services.CaisseService
import com.example.backend.utility.UserUtils
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/caisses")
class CaisseController(
  private val userUtils: UserUtils,
  private val caisseService: CaisseService,
  private val employeRepository: EmployeRepository,
  private val userRepository: UserRepository
) {

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping("/ouvrir")
  fun ouvrirCaisse(@RequestBody ouvertureRequestDto: CaisseOuvertureRequestDto): ResponseEntity<Any> {
    return try {
      val caisseDto = caisseService.ouvrirCaisse(ouvertureRequestDto)
      ResponseEntity.ok(caisseDto)
    } catch (e: CaisseException) {
      ResponseEntity.status(HttpStatus.CONFLICT).body(mapOf("error" to e.message))
    } catch (e: Exception) {
      ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(mapOf("error" to "Une erreur interne est survenue: ${e.message}"))
    }
  }


  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/active/details")
  fun getActiveCaisseDetails(): ResponseEntity<Map<String, Any?>> {
    return try {
      val activeCaisse = caisseService.getActiveCaisse()
      if (activeCaisse != null) {
        val employeName = activeCaisse.user?.user?.nom ?: "Inconnu"
        val caisseDetails = mapOf(
          "id" to activeCaisse.id,
          "etat" to activeCaisse.etat,
          "nomEmploye" to employeName,
          "dateOuvert" to activeCaisse.dateOuvert,
          "dateFerme" to activeCaisse.dateFerme
        )
        ResponseEntity.ok(caisseDetails)
      } else {
        ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to "Aucune caisse active trouvée"))
      }
    } catch (e: Exception) {
      ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(mapOf("error" to "Une erreur interne est survenue: ${e.message}"))
    }
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/active/details/pageable")
  fun getActiveCaissesDetailsPageable(
    @RequestParam(defaultValue = "0") page: Int,
    @RequestParam(defaultValue = "10") size: Int,
    @RequestParam(defaultValue = "id") sortBy: String
  ): ResponseEntity<Page<Map<String, Any?>>> {
    return try {
      val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy))
      val caisseDetails = caisseService.getAllCaisse(pageable)
      ResponseEntity.ok(caisseDetails)
    } catch (e: Exception) {
      ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Page.empty())
    }
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/ouverte")
  fun isCaisseOuverte(): ResponseEntity<Map<String, Any?>> {
    val isOuverte = caisseService.isCaisseOuverte()
    val activeCaisse = caisseService.getActiveCaisse()
    val attenteCloture = caisseService.getCaisseAttenteCloture()
    val employeCurrentId = userUtils.getCurrentEmployeId()
    var employe = employeRepository.findById(employeCurrentId!!.toInt()).get()

    val response = when {
      activeCaisse != null && activeCaisse.user?.id == employe.id?.toInt() -> {
        mapOf(
          "status" to "active",
          "caisseDetails" to mapOf(
            "id" to activeCaisse.id,
            "etat" to activeCaisse.etat,
            "session" to activeCaisse.session,
            "nomEmploye" to (activeCaisse.user?.user?.nom ?: "Inconnu"),
            "dateOuvert" to activeCaisse.dateOuvert,
            "dateFerme" to activeCaisse.dateFerme
          )
        )
      }
      activeCaisse != null && activeCaisse.user?.id != employe.id?.toInt() -> {
        mapOf(
          "status" to "already_open",
          "caisseDetails" to mapOf(
            "id" to activeCaisse.id,
            "etat" to activeCaisse.etat,
            "session" to activeCaisse.session,
            "nomEmploye" to (activeCaisse.user?.user?.nom ?: "Inconnu"),
            "dateOuvert" to activeCaisse.dateOuvert,
            "dateFerme" to activeCaisse.dateFerme
          )
        )
      }

      attenteCloture != null && attenteCloture.user?.id == employe.id?.toInt() -> {
        mapOf(
          "status" to "pending_closure",
          "caisseDetails" to mapOf(
            "id" to attenteCloture.id,
            "session" to attenteCloture.session,
            "etat" to attenteCloture.etat,
            "nomEmploye" to (attenteCloture.user!!.user?.nom ?: "Inconnu"),
            "dateOuvert" to attenteCloture.dateOuvert,
            "dateFerme" to attenteCloture.dateFerme
          )
        )
      }
      else -> {
        mapOf(
          "status" to "none",
          "caisseDetails" to null
        )
      }
    }

    return ResponseEntity.ok(response)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PutMapping("/active/attente-cloture")
  fun setCaisseToPendingClosure(): ResponseEntity<Map<String, Any?>> {
      return try {
          val updatedCaisse = caisseService.setCaisseToPendingClosure()
          ResponseEntity.ok(mapOf("message" to "La caisse a été mise en attente de clôture.", "caisse" to updatedCaisse))
      } catch (e: CaisseException) {
          ResponseEntity.status(HttpStatus.CONFLICT).body(mapOf("error" to e.message))
      } catch (e: Exception) {
          ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
              .body(mapOf("error" to "Une erreur interne est survenue: ${e.message}"))
      }
  }


  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping("/cloturer")
  fun cloturerCaisse(
    @RequestBody caisseClotureRequest: CaisseClotureRequestDto
  ): ResponseEntity<Any> {
    return try {
      val caisseDto = caisseService.cloturerCaisse(caisseClotureRequest.fondCaisseFerme, caisseClotureRequest.fermetureCaisse)
      ResponseEntity.ok(caisseDto)
    } catch (e: CaisseException) {
      ResponseEntity.status(HttpStatus.CONFLICT).body(mapOf("error" to e.message))
    } catch (e: Exception) {
      ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(mapOf("error" to "Une erreur interne est survenue: ${e.message}"))
    }
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/cloture/details")
  fun getCaisseClosureDetails(): ResponseEntity<Any> {
    return try {
      val caisseDetails = caisseService.getCaisseAttenteCloture()
      if (caisseDetails != null) {
        ResponseEntity.ok(caisseDetails)
      } else {
        ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to "Aucune caisse en attente de clôture trouvée"))
      }
    } catch (e: Exception) {
      ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(mapOf("error" to "Une erreur interne est survenue: ${e.message}"))
    }
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{caisseId}/rapport")
  fun getCaisseReport(@PathVariable caisseId: Long): ResponseEntity<Map<String, Any?>> {
    return try {
      val reportData = caisseService.generateCaisseReport(caisseId)
      ResponseEntity.ok(reportData)
    } catch (e: Exception) {
      ResponseEntity.status(500).body(mapOf("error" to "An internal error occurred: ${e.message}"))
    }
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/all/pageable")
  fun getAllCaisses(
      @RequestParam(defaultValue = "0") page: Int,
      @RequestParam(defaultValue = "10") size: Int,
      @RequestParam(defaultValue = "id") sortBy: String
  ): ResponseEntity<Page<Map<String, Any?>>> {
      return try {
          val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy))
          val caisses = caisseService.getAllCaisses(pageable)
          ResponseEntity.ok(caisses)
      } catch (e: Exception) {
          ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Page.empty())
      }
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/all/filter")
  fun getFilteredCaisses(
      @RequestParam(required = false) caisseId: Long?,
      @RequestParam(required = false) startDate: String?,
      @RequestParam(required = false) endDate: String?,
      @RequestParam(defaultValue = "0") page: Int,
      @RequestParam(defaultValue = "10") size: Int
  ): ResponseEntity<Page<Map<String, Any?>>> {
      val pageable = PageRequest.of(page, size)
      val caisses = caisseService.getFilteredCaisses(caisseId, startDate, endDate, pageable)
      return ResponseEntity.ok(caisses)
  }

}
