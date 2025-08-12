package com.example.backend.services

import com.example.backend.models.Prescripteur
import com.example.backend.repositories.PrescripteurRepository
import org.springframework.stereotype.Service
import kotlin.jvm.optionals.getOrNull

@Service
class PrescripteurService(private val prescripteurRepository: PrescripteurRepository) {

  fun createPrescripteur(prescripteur: Prescripteur): Prescripteur = prescripteurRepository.save(prescripteur)

  fun getAllPrescripteurs(): List<Prescripteur> = prescripteurRepository.findAll()

  fun updatePrescripteur(id: Int, updatedPrescripteur: Prescripteur): Prescripteur {
    val existingPrescripteur = prescripteurRepository.findById(id).orElseThrow { Exception("Prescripteur not found") }
    existingPrescripteur.nom = updatedPrescripteur.nom
    return prescripteurRepository.save(existingPrescripteur)
  }

  fun deletePrescripteur(id: Int) {
    if (!prescripteurRepository.existsById(id)) throw Exception("Prescripteur not found")
//    prescripteurRepository.deleteById(id)
    var prescripteur =  prescripteurRepository.findById(id).getOrNull()
    prescripteur?.supprimer=1
    prescripteurRepository.save(prescripteur!!)
  }
}
