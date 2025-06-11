package com.example.backend.services

import com.example.backend.dtos.CommandeDTO
import com.example.backend.dtos.ProduitResponseDto
import com.example.backend.models.Commande
import com.example.backend.models.User
import com.example.backend.repositories.CommandeRepository
import com.example.backend.repositories.UserRepository
import jakarta.persistence.EntityNotFoundException
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.util.*

@Service
class CommandeService(
  private val commandeRepository: CommandeRepository,
  private val userRepository: UserRepository
) {

  fun creerCommande(commandeDto: CommandeDto): Commande {
    val commande = Commande(
      // Initialisation des champs à partir de commandeDto
    )
    return commandeRepository.save(commande)
  }

  fun obtenirCommande(id: Long): Commande {
    return commandeRepository.findById(id).orElseThrow {
      EntityNotFoundException("Commande non trouvée avec l'id $id")
    }
  }

  fun validerCommande(id: Long): Commande {
    val commande = obtenirCommande(id)
    commande.validee = true
    return commandeRepository.save(commande)
  }

  fun creerCommandeAvecProduits(commandeDto: CommandeDTO, produits: List<ProduitResponseDto>): Commande {
      val commande = Commande(
          employeId = commandeDto.employeId,
          dateCreation = LocalDateTime.now(),
          fournisseurId = commandeDto.fournisseurId,
          montantCmd = produits.sumOf { it.prixUnitaire * it.quantite },
          etat = "EN_COURS"
      )
      val savedCommande = commandeRepository.save(commande)

      produits.forEach { produitDto ->
          val produitCmd = ProduitCmd(
              produitId = produitDto.produitId,
              commandeId = savedCommande.id,
              qtiteCmd = produitDto.quantite,
              puCmd = produitDto.prixUnitaire,
              ptCmd = produitDto.prixUnitaire * produitDto.quantite,
              etat = "EN_COURS"
          )
          produitCmdRepository.save(produitCmd)
      }

      return savedCommande
  }

  fun mettreAJourEtatCommande(id: Long, nouvelEtat: String): Commande {
      val commande = obtenirCommande(id)
      commande.etat = nouvelEtat
      return commandeRepository.save(commande)
  }

  fun obtenirProduitsParCommande(idCommande: Long): List<ProduitCmd> {
      return produitCmdRepository.findByCommandeId(idCommande)
  }

  fun supprimerCommande(id: Long) {
      val commande = obtenirCommande(id)
      commande.supprimer = 1
      commandeRepository.save(commande)
  }

  fun calculerMontantTotalCommande(idCommande: Long): Double {
      val produits = obtenirProduitsParCommande(idCommande)
      return produits.sumOf { it.ptCmd }
  }

  fun listerCommandesParFournisseur(fournisseurId: Int): List<Commande> {
      return commandeRepository.findByFournisseurId(fournisseurId)
  }
}
