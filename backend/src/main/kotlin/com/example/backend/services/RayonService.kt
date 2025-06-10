package com.example.backend.services

import com.example.backend.models.Rayon
import com.example.backend.repositories.RayonRepository
import org.springframework.stereotype.Service

@Service
class RayonService(private val rayonRepository: RayonRepository) {

    fun createRayon(rayon: Rayon): Rayon = rayonRepository.save(rayon)

    fun getAllRayons(): List<Rayon> = rayonRepository.findAll()

    fun updateRayon(id: Int, updatedRayon: Rayon): Rayon {
        val existingRayon = rayonRepository.findById(id).orElseThrow { Exception("Rayon not found") }
        existingRayon.nom = updatedRayon.nom
        existingRayon.code = updatedRayon.code
        return rayonRepository.save(existingRayon)
    }

    fun deleteRayon(id: Int) {
        if (!rayonRepository.existsById(id)) throw Exception("Rayon not found")
        rayonRepository.deleteById(id)
    }
}
