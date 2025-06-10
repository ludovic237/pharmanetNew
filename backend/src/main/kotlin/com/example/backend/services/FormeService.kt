package com.example.backend.services

import com.example.backend.models.Forme
import com.example.backend.repositories.FormeRepository
import org.springframework.stereotype.Service

@Service
class FormeService(private val formeRepository: FormeRepository) {

    fun createForme(forme: Forme): Forme = formeRepository.save(forme)

    fun getAllFormes(): List<Forme> = formeRepository.findAll()

    fun updateForme(id: Int, updatedForme: Forme): Forme {
        val existingForme = formeRepository.findById(id).orElseThrow { Exception("Forme not found") }
        existingForme.nom = updatedForme.nom
        return formeRepository.save(existingForme)
    }

    fun deleteForme(id: Int) {
        if (!formeRepository.existsById(id)) throw Exception("Forme not found")
        formeRepository.deleteById(id)
    }
}
