package com.example.backend.services

import com.example.backend.models.Fabriquant
import com.example.backend.repositories.FabriquantRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import kotlin.jvm.optionals.getOrNull

@Service
class FabriquantService(private val fabriquantRepository: FabriquantRepository) {

    fun createFabriquant(fabriquant: Fabriquant): Fabriquant = fabriquantRepository.save(fabriquant)

    fun getAllFabriquants(): List<Fabriquant> = fabriquantRepository.findAll()

    fun getAllFabriquantsPage(pageable: Pageable): Page<Fabriquant> = fabriquantRepository.findAll(pageable)

    fun updateFabriquant(id: Int, updatedFabriquant: Fabriquant): Fabriquant {
        val existingFabriquant = fabriquantRepository.findById(id).orElseThrow { Exception("Fabriquant not found") }
        existingFabriquant.nom = updatedFabriquant.nom
        existingFabriquant.adresse = updatedFabriquant.adresse
        existingFabriquant.telephone = updatedFabriquant.telephone
        existingFabriquant.email = updatedFabriquant.email
        return fabriquantRepository.save(existingFabriquant)
    }

    fun deleteFabriquant(id: Int) {
        if (!fabriquantRepository.existsById(id)) throw Exception("Fabriquant not found")
//        fabriquantRepository.deleteById(id)
       var fabriquant =  fabriquantRepository.findById(id).getOrNull()
      fabriquant?.supprimer=1
      fabriquantRepository.save(fabriquant!!)
    }
}
