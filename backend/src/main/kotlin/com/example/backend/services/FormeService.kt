package com.example.backend.services

import com.example.backend.models.Forme
import com.example.backend.repositories.FormeRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import kotlin.jvm.optionals.getOrNull

@Service
class FormeService(private val formeRepository: FormeRepository) {

    fun createForme(forme: Forme): Forme = formeRepository.save(forme)

    fun getAllFormes(): List<Forme> = formeRepository.findAll()

    fun getAllFormesRange(pageable: Pageable): Page<Forme> = formeRepository.findAll(pageable)

    fun updateForme(id: Int, updatedForme: Forme): Forme {
        val existingForme = formeRepository.findById(id).orElseThrow { Exception("Forme not found") }
        existingForme.nom = updatedForme.nom
        return formeRepository.save(existingForme)
    }

    fun deleteForme(id: Int) {
        if (!formeRepository.existsById(id)) throw Exception("Forme not found")
//        formeRepository.deleteById(id)
      var forme =  formeRepository.findById(id).getOrNull()
      forme?.supprimer=1
      formeRepository.save(forme!!)
    }
}
