package com.example.backend.services

import com.example.backend.controllers.BonCaisseData
import com.example.backend.models.BonCaisse
import com.example.backend.repositories.BonCaisseRepository
import com.example.backend.repositories.CaisseRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Service
class BonCaisseService(
  private val caisseRepository: CaisseRepository,
  private val caisseService: CaisseService,
  private val bonCaisseRepository: BonCaisseRepository,
) {

  fun getAllBons(): List<BonCaisse> {
    return bonCaisseRepository.findAll()
  }

  fun getBonById(id: Int): BonCaisse {
    return bonCaisseRepository.findById(id)
      .orElseThrow { IllegalArgumentException("BonCaisse with ID $id not found") }
  }

  fun getBonByCodebarreId(codebarreId: String): BonCaisse? {
    return bonCaisseRepository.findByCodebarreId(codebarreId)
  }

  fun createBon(bon: BonCaisseData): BonCaisse {
    val dateCode = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMddHHmmss"))
    val bonCaisse = BonCaisse().apply {
      caisse = caisseService.getActiveCaisse()
//      caisseIdEncaisser = caisseService.getActiveCaisse()?.id
      nomClient = bon.nomClient
      montant = bon.montant
     this.codebarreId = dateCode
     this.dateGenerer = LocalDateTime.now()
     this.type = "Générer" // Default type
     this.supprimer = 0
    }
    return bonCaisseRepository.save(bonCaisse)
  }

  fun updateBon(codebarreId: String): BonCaisse {
    val existingBon = bonCaisseRepository.findByCodebarreId(codebarreId)

    if (existingBon!!.type == "Encaisser") {
      throw IllegalStateException("BonCaisse with ID $codebarreId is already Encaisser")
    }

    existingBon.type = "Encaisser" // Transition to Encaisser
    existingBon.dateEncaisser = LocalDateTime.now() // Set the encaisser date
    existingBon.caisseIdEncaisser = caisseService.getActiveCaisse()!!.id

    return bonCaisseRepository.save(existingBon)
  }

  fun deleteBon(id: Int) {
    val bon = bonCaisseRepository.findById(id)
      .orElseThrow { IllegalArgumentException("BonCaisse with ID $id not found") }
    bon.supprimer = 1
    bonCaisseRepository.save(bon)
  }
}
