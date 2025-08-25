package com.example.backend.services

import com.example.backend.models.Categorie
import com.example.backend.models.Magasin
import com.example.backend.repositories.MagasinRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import kotlin.jvm.optionals.getOrNull

@Service
class MagasinService(private val magasinRepository: MagasinRepository) {

  fun createMagasin(magasin: Magasin): Magasin = magasinRepository.save(magasin)

  fun getAllMagasins(): List<Magasin> = magasinRepository.findAll()

  fun getAllMagasinsPage(pageable: Pageable): Page<Magasin> {
    return magasinRepository.findAll(pageable)
  }

  fun updateMagasin(id: Int, updatedMagasin: Magasin): Magasin {
    val existingMagasin = magasinRepository.findById(id).orElseThrow { Exception("Magasin not found") }
    existingMagasin.nom = updatedMagasin.nom
//        existingMagasin.adresse = updatedMagasin.adresse
    return magasinRepository.save(existingMagasin)
  }

  fun deleteMagasin(id: Int) {
    if (!magasinRepository.existsById(id)) throw Exception("Magasin not found")
//        magasinRepository.deleteById(id)
    var magasin = magasinRepository.findById(id).getOrNull()
    magasin?.supprimer = 1
    magasinRepository.save(magasin!!)
  }
}
