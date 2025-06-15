package com.example.backend.services

import com.example.backend.dtos.CaisseDto
import com.example.backend.dtos.CaisseOuvertureRequestDto
import com.example.backend.dtos.EncaissementRequestDto
import com.example.backend.dtos.VenteRequestDto
import com.example.backend.models.*
import com.example.backend.repositories.*
import com.example.backend.utility.UserUtils
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.*

@Service
class VenteService(
  private val concernerRepository: ConcernerRepository,
  private val venteRepository: VenteRepository,
  private val caisseRepository: CaisseRepository,
  private val produitRepository: ProduitRepository,
  private val facturationRepository: FacturationRepository,
  private val factureEspeceRepository: FactureEspeceRepository,
  private val factureElectroniqueRepository: FactureElectroniqueRepository,
  private val factureTicketRepository: FactureTicketRepository,
  private val employeRepository: EmployeRepository,
  private val userUtils: UserUtils
) {

  @Transactional
  fun creerVenteSansEncaissement(venteRequestDto: VenteRequestDto): Vente {
    val currentUser = userUtils.getCurrentUser()
      ?: throw RuntimeException("Impossible de récupérer l'utilisateur connecté.")

    val employe = employeRepository.findByUser(currentUser)
      ?: throw RuntimeException("Employé introuvable pour l'utilisateur connecté.")

    if (venteRequestDto.etat !in listOf("COMPTANT", "ASSURANCE", "CREDIT")) {
      throw RuntimeException("État de la vente invalide: ${venteRequestDto.etat}")
    }

    val nouvelleVente = Vente().apply {
      this.employe = employe
      this.dateVente = LocalDateTime.now()
      this.etat = venteRequestDto.etat
      this.prixTotal = venteRequestDto.prixTotal
      this.commentaire = venteRequestDto.commentaire
      this.supprimer = 0
    }

    val savedVente = venteRepository.save(nouvelleVente)

    venteRequestDto.produits.forEach { produitAssocieDto ->
      val produit = produitRepository.findById(produitAssocieDto.produitId.toInt())
        .orElseThrow { RuntimeException("Produit introuvable avec l'ID: ${produitAssocieDto.produitId}") }

      val concerner = Concerner().apply {
        this.vente = savedVente
        this.produit = produit
        this.quantite = produitAssocieDto.quantite
        this.prixUnit = produitAssocieDto.prixUnit
      }

      concernerRepository.save(concerner)
    }

    return savedVente
  }

  @Transactional
  fun encaisserVente(venteId: Long, encaissementRequestDto: EncaissementRequestDto): Facturation {
    val vente = venteRepository.findById(venteId)
      .orElseThrow { RuntimeException("Vente introuvable avec l'ID: $venteId") }

    if (vente.etat != "EN_COURS") {
      throw RuntimeException("La vente doit être en cours pour être encaissée.")
    }

    val currentUser = userUtils.getCurrentUser()
    val employe = employeRepository.findByUser(currentUser!!)
    val caisse = caisseRepository.findByEmployeAndEtatAndSupprimer(employe, Caisse.ETAT_OUVERT)
      ?: throw RuntimeException("Aucune caisse ouverte trouvée pour l'utilisateur connecté.")

    val facturation = Facturation().apply {
      this.vente = vente
      this.caisse = caisse
      this.typePaiement = encaissementRequestDto.typePaiement
      this.montantPercu = encaissementRequestDto.montantPercu
      this.reste = encaissementRequestDto.reste
      this.montantTtc = encaissementRequestDto.montantTtc
      this.dateFacture = LocalDateTime.now()
      this.supprimer = 0
    }

    when (encaissementRequestDto.typePaiement.toLowerCase()) {
      Vente.VENTE_TYPE_PAIEMENT_ESPECE.toLowerCase() -> {
        encaissementRequestDto.espece?.let { montantEspece ->
          val factureEspece = FactureEspece().apply {
            this.facturationId = facturation.id?.toLong()
            this.montant = montantEspece
          }
          factureEspeceRepository.save(factureEspece)
        }
      }

      Vente.VENTE_TYPE_PAIEMENT_ELECTRONIQUE.toLowerCase() -> {
        encaissementRequestDto.electronique?.let { electronique ->
          val factureElectronique = FactureElectronique().apply {
            this.facturationId = facturation.id?.toLong()
            this.numeroTelephone = electronique.numeroTelephone
            this.montant = electronique.montant
          }
          factureElectroniqueRepository.save(factureElectronique)
        }
      }

      Vente.VENTE_TYPE_PAIEMENT_TICKET.toLowerCase() -> {
        encaissementRequestDto.ticket?.let { montantTicket ->
          val factureTicket = FactureTicket().apply {
            this.facturationId = facturation.id?.toLong()
            this.montant = montantTicket
          }
          factureTicketRepository.save(factureTicket)
        }
      }

      Vente.VENTE_TYPE_PAIEMENT_MIXTE.toLowerCase() -> {
        encaissementRequestDto.espece?.let { montantEspece ->
          val factureEspece = FactureEspece().apply {
            this.facturationId = facturation.id?.toLong()
            this.montant = montantEspece
          }
          factureEspeceRepository.save(factureEspece)
        }
        encaissementRequestDto.electronique?.let { electronique ->
          val factureElectronique = FactureElectronique().apply {
            this.facturationId = facturation.id?.toLong()
            this.numeroTelephone = electronique.numeroTelephone
            this.montant = electronique.montant
          }
          factureElectroniqueRepository.save(factureElectronique)
        }
        encaissementRequestDto.ticket?.let { montantTicket ->
          val factureTicket = FactureTicket().apply {
            this.facturationId = facturation.id?.toLong()
            this.montant = montantTicket
          }
          factureTicketRepository.save(factureTicket)
        }
      }

      else -> throw RuntimeException("Type de paiement non pris en charge: ${encaissementRequestDto.typePaiement}")
    }

    // Update sale status
//    vente.etat = "ENCAISSE"
    venteRepository.save(vente)

    return facturationRepository.save(facturation)
  }

  @Transactional(readOnly = true)
  fun chargerVentesEnCoursNonEncaisser(venteId: Long): Map<String, Any?> {
    val ventes = venteRepository.findById(venteId).get()
    if (ventes.prixPercu != null && ventes.prixPercu!! > 0) {
      throw RuntimeException("La vente est déjà encaissée.")
    }
    val produits = concernerRepository.findByVente(ventes)
    return mapOf(
      "vente" to ventes,
      "produits" to produits
    )
  }


}
