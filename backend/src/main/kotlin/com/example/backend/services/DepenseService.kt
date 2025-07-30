package com.example.backend.services

import com.example.backend.models.Depense
import com.example.backend.repositories.DepenseRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.time.OffsetDateTime

@Service
class DepenseService(
  private val caisseService: CaisseService,
  private val depenseRepository: DepenseRepository
) {

  fun getAllDepenses(): List<Depense> {
    return depenseRepository.findAll()
  }

  fun createDepense(designation: String, prixUnitaire: Int): Depense {
    var caisseId = caisseService.getCaisseActive()!!.id
    val depense = Depense().apply {
      this.caisseId = caisseId.toString()
      this.designation = designation
      this.prixUnitaire = prixUnitaire
      this.dateDepense = LocalDateTime.now()
    }
    return depenseRepository.save(depense)
  }

  fun createDepenseMap(data:Map<String,Any?>): Depense {
    val designation = data["designation"] as? String
    val quantite = data["quantite"] as? Int
    val dateDepense = data["dateDepense"] as? String
    val dateDepenseTime = OffsetDateTime.parse(dateDepense!!.trim()).toLocalDateTime()
    val beneficiaire = data["beneficiaire"] as? String
    val numeroCni = data["numeroCni"] as? String
    val dateDelivrance = data["dateDelivrance"] as? String
    val dateDelivranceTime = OffsetDateTime.parse(dateDelivrance!!.trim()).toLocalDateTime()
    val lieuDelivrance = data["lieuDelivrance"] as? String
    val societe = data["societe"] as? String
    val typeDepense = data["typeDepense"] as? String
    val prixUnitaire = data["prixUnitaire"] as? Int
    var caisseId = caisseService.getCaisseActive()!!.id


    val depense = Depense().apply {
      this.caisseId = caisseId.toString()
      this.designation = designation
      this.quantite = quantite
      this.dateDepense = dateDepenseTime
      this.beneficiaire = beneficiaire
      this.numeroCni = numeroCni
      this.dateDelivrance = dateDelivranceTime
      this.lieuDelivrance = lieuDelivrance
      this.societe = societe
//      this.typeDepense = typeDepense
      this.prixUnitaire = prixUnitaire
    }
    return depenseRepository.save(depense)
  }

  fun updateDepense(id: Int, designation: String, prixUnitaire: Int): Depense {
    val existingDepense = depenseRepository.findById(id)
      .orElseThrow { IllegalArgumentException("Depense with ID $id not found") }
    existingDepense.apply {
      this.designation = designation
      this.prixUnitaire = prixUnitaire
    }
    return depenseRepository.save(existingDepense)
  }

  fun deleteDepense(id: Int) {
    val depense = depenseRepository.findById(id)
      .orElseThrow { IllegalArgumentException("Depense with ID $id not found") }
    depenseRepository.delete(depense)
  }
}
