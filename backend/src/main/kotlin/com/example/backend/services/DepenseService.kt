package com.example.backend.services

import com.example.backend.models.Depense
import com.example.backend.repositories.DepenseRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class DepenseService(
  private val caisseService: CaisseService,
  private val depenseRepository: DepenseRepository
) {

  fun getAllDepenses(): List<Depense> {
    return depenseRepository.findAll()
  }

  fun createDepense(designation: String, prixUnitaire: Int): Depense {
    var caisseId = caisseService.getActiveCaisse()!!.id
    val depense = Depense().apply {
      this.caisseId = caisseId.toString()
      this.designation = designation
      this.prixUnitaire = prixUnitaire
      this.dateDepense = LocalDateTime.now()
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
